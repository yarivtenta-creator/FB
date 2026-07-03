<#
.SYNOPSIS
    Claude Code adapter. Import local Claude Code session transcripts
    (~/.claude/projects/**/*.jsonl) as canonical conversation records.

.DESCRIPTION
    Emits canonical records only. Each .jsonl session becomes one conversation:
    the messages are linearized to a Markdown transcript (cold archive in _RAW),
    indexed (type=conversation, source=claude-code, project=UNASSIGNED), and a
    compact card is written. The .jsonl schema is versioned/undocumented, so
    parsing is defensive — unknown lines are skipped, never fatal.

.PARAMETER Path
    A .jsonl file, or a folder scanned recursively for *.jsonl (e.g.
    "$env:USERPROFILE\.claude\projects").

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Import-ClaudeCode.ps1 -Path "$env:USERPROFILE\.claude\projects"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Path,
    [string]$Root
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
if (-not (Test-Path -LiteralPath $Path)) { throw "Path not found: $Path" }

$files = @(if ((Get-Item -LiteralPath $Path).PSIsContainer) {
    Get-ChildItem -LiteralPath $Path -Filter '*.jsonl' -File -Recurse -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
} else { $Path })
if ($files.Count -eq 0) { Write-Host "No .jsonl files found." -ForegroundColor Yellow; return }

function Get-CCText {
    param($Content)
    if ($null -eq $Content) { return '' }
    if ($Content -is [string]) { return $Content }
    if ($Content -is [System.Array]) {
        $out = foreach ($p in $Content) {
            if ($p -is [string]) { $p }
            elseif ($p -and ($p.PSObject.Properties.Name -contains 'text')) { $p.text }
        }
        return (($out | Where-Object { $_ }) -join "`n")
    }
    if ($Content.PSObject.Properties.Name -contains 'text') { return $Content.text }
    return ''
}

$seen = Get-IndexHashes -Root $Root
$imported = 0; $skipped = 0; $empty = 0
$dateStr = Get-Date -Format 'yyyy-MM-dd'

foreach ($f in $files) {
    try {
        $lines = Get-Content -LiteralPath $f -Encoding utf8 | Where-Object { $_ -and $_.Trim() }
        $messages = New-Object System.Collections.Generic.List[object]
        $title = ''
        $convDate = $dateStr
        foreach ($ln in $lines) {
            $obj = $null; try { $obj = $ln | ConvertFrom-Json } catch { continue }
            $props = $obj.PSObject.Properties.Name
            # Session summary line (Claude Code writes {type:summary, summary:...}).
            if (($props -contains 'type') -and $obj.type -eq 'summary' -and ($props -contains 'summary') -and -not $title) {
                $title = [string]$obj.summary; continue
            }
            if ($props -notcontains 'message' -or $null -eq $obj.message) { continue }
            $m = $obj.message
            $mProps = $m.PSObject.Properties.Name
            $role = if ($mProps -contains 'role') { $m.role } elseif ($props -contains 'type') { $obj.type } else { '' }
            if ($role -notin @('user', 'assistant')) { continue }
            $text = ''
            if ($mProps -contains 'content') { $text = Get-CCText -Content $m.content }
            $text = ([string]$text).Trim()
            if ([string]::IsNullOrWhiteSpace($text)) { continue }
            if (($props -contains 'timestamp') -and $obj.timestamp) {
                try { $convDate = ([datetimeoffset]::Parse($obj.timestamp)).ToString('yyyy-MM-dd') } catch { }
            }
            $messages.Add(@{ Role = $role; Text = $text })
        }

        if ($messages.Count -eq 0) { $empty++; continue }
        if ([string]::IsNullOrWhiteSpace($title)) {
            $firstUser = ($messages | Where-Object { $_.Role -eq 'user' } | Select-Object -First 1)
            $title = if ($firstUser) { ($firstUser.Text -replace '\s+', ' ').Trim() } else { [System.IO.Path]::GetFileNameWithoutExtension($f) }
            if ($title.Length -gt 60) { $title = $title.Substring(0, 57) + '...' }
        }

        $sb = New-Object System.Text.StringBuilder
        [void]$sb.AppendLine("# $title"); [void]$sb.AppendLine()
        foreach ($m in $messages) { [void]$sb.AppendLine("## $($m.Role)"); [void]$sb.AppendLine(); [void]$sb.AppendLine($m.Text); [void]$sb.AppendLine() }
        $transcript = $sb.ToString()
        $sha = Get-StringSha256 -Text $transcript
        if ($seen.ContainsKey($sha)) { $skipped++; continue }
        $id = New-IngestId $sha

        $rawDir = Get-RawDir -Root $Root -Source 'claude-code' -DateStr $dateStr
        $rawFile = Join-Path $rawDir ("cc_{0}_{1}.md" -f ([System.IO.Path]::GetFileNameWithoutExtension($f)), $id)
        if (-not (Test-Path -LiteralPath $rawFile)) {
            [System.IO.File]::WriteAllText($rawFile, $transcript, (New-Object System.Text.UTF8Encoding($false)))
            Write-ActionLog -Root $Root -Level 'CREATE' -Message "Archived CC transcript: $rawFile"
        }
        $rawRel = $rawFile.Substring($Root.Length).TrimStart('\', '/')

        $firstUser = ($messages | Where-Object { $_.Role -eq 'user' } | Select-Object -First 1).Text
        $lastAsst = ($messages | Where-Object { $_.Role -eq 'assistant' } | Select-Object -Last 1).Text
        function Clip { param($t, $n = 240) if (-not $t) { return '' }; $t = ($t -replace '\s+', ' ').Trim(); if ($t.Length -gt $n) { $t.Substring(0, $n - 1) + '…' } else { $t } }

        Add-CanonicalItem -Root $Root -Seen $seen -Record @{
            id = $id; type = 'conversation'; source = 'claude-code'; project = 'UNASSIGNED'
            title = $title; date_added = $convDate; sha256 = $sha; ext = '.md'
            bytes = [System.Text.Encoding]::UTF8.GetByteCount($transcript)
            contains = ("{0} messages" -f $messages.Count)
            purpose = "**Asked:** $(Clip $firstUser)`n`n**Outcome:** $(Clip $lastAsst)"
            status = 'NEEDS_REVIEW'; raw_path = $rawRel; original_path = $f
            source_ref = 'claude-code-jsonl'; needs_review_reason = 'unassigned project; summary pending audit'
        } | Out-Null
        $imported++
    }
    catch {
        Write-ActionLog -Root $Root -Level 'WARN' -Message "Claude Code ingest failed for '$f': $($_.Exception.Message)"
        Write-Warning "Failed: $f — $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Claude Code ingestion complete." -ForegroundColor Green
Write-Host ("  Imported : {0}   Duplicates : {1}   Empty : {2}" -f $imported, $skipped, $empty)
Write-ActionLog -Root $Root -Level 'INFO' -Message "Import-ClaudeCode: $imported imported, $skipped dup, $empty empty from $($files.Count) file(s)"
