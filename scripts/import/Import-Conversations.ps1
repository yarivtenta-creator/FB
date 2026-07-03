<#
.SYNOPSIS
    Conversation adapter (Phase 0 ingestion). Import a ChatGPT or Claude data
    export (conversations.json) into the memory system: archive the full
    transcript to _RAW, index each conversation, and write a compact card.
    Deterministic and non-destructive — no LLM. The true summary is produced
    later, in the one-time Audit.

.DESCRIPTION
    Auto-detects the export format (ChatGPT vs Claude) and normalizes each
    conversation to the canonical record. For each conversation it:
      1. Linearizes the messages into a Markdown transcript.
      2. Hashes it (SHA-256) — exact duplicates are skipped.
      3. Writes the transcript to _RAW\<source>\<date>\ (cold archive).
      4. Appends a record to _INDEX\master_index.ndjson (type=conversation,
         project=UNASSIGNED, status=NEEDS_REVIEW).
      5. Writes a compact card to _INDEX\conversations\<id>.md, including an
         extractive preview (first user ask + last assistant reply).

.PARAMETER Path
    Path to a conversations.json (ChatGPT or Claude export).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.PARAMETER Source
    Override the detected source label ('chatgpt' | 'claude'). Optional.

.EXAMPLE
    .\Import-Conversations.ps1 -Path "D:\exports\chatgpt\conversations.json"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Path,
    [string]$Root,
    [string]$Source
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
if (-not (Test-Path -LiteralPath $Path)) { throw "File not found: $Path" }

$raw = Get-Content -LiteralPath $Path -Raw -Encoding utf8
try { $data = $raw | ConvertFrom-Json } catch { throw "Not valid JSON: $Path" }
if ($data -isnot [System.Array]) { $data = @($data) }

# --- format detection ---------------------------------------------------------
function Get-ExportFormat {
    param($Sample)
    if ($null -eq $Sample) { return 'unknown' }
    $props = $Sample.PSObject.Properties.Name
    if ($props -contains 'mapping') { return 'chatgpt' }
    if ($props -contains 'chat_messages') { return 'claude' }
    return 'unknown'
}
$format = Get-ExportFormat -Sample ($data | Select-Object -First 1)
if (-not $Source) { $Source = if ($format -eq 'unknown') { 'conversations' } else { $format } }
Write-Host ("Detected export format: {0}  ({1} conversations)" -f $format, $data.Count) -ForegroundColor Cyan

# --- text extraction helpers --------------------------------------------------
function Get-PartText {
    param($Content)
    if ($null -eq $Content) { return '' }
    if ($Content -is [string]) { return $Content }
    # ChatGPT: content.parts = array of strings/objects
    if ($Content.PSObject.Properties.Name -contains 'parts') {
        $out = foreach ($p in $Content.parts) {
            if ($p -is [string]) { $p }
            elseif ($p -and ($p.PSObject.Properties.Name -contains 'text')) { $p.text }
        }
        return (($out | Where-Object { $_ }) -join "`n")
    }
    # Claude: content = array of {type:text, text:...}
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

function Get-Messages {
    <# Return an ordered array of @{Role;Text} for one conversation, either format. #>
    param($Conv, [string]$Fmt)
    $msgs = New-Object System.Collections.Generic.List[object]

    if ($Fmt -eq 'chatgpt') {
        # Flatten the mapping tree; sort by message create_time when present.
        $nodes = @()
        foreach ($prop in $Conv.mapping.PSObject.Properties) {
            $m = $prop.Value.message
            if ($null -eq $m) { continue }
            $role = $m.author.role
            if ($role -notin @('user', 'assistant')) { continue }
            $mProps2 = $m.PSObject.Properties.Name
            $mContent = if ($mProps2 -contains 'content') { $m.content } else { $null }
            $text = (Get-PartText -Content $mContent).Trim()
            if ([string]::IsNullOrWhiteSpace($text)) { continue }
            $ct = if (($mProps2 -contains 'create_time') -and $m.create_time) { [double]$m.create_time } else { 0 }
            $nodes += [pscustomobject]@{ Role = $role; Text = $text; T = $ct }
        }
        foreach ($n in ($nodes | Sort-Object T)) { $msgs.Add(@{ Role = $n.Role; Text = $n.Text }) }
    }
    elseif ($Fmt -eq 'claude') {
        foreach ($m in $Conv.chat_messages) {
            $role = switch ($m.sender) { 'human' { 'user' } 'assistant' { 'assistant' } default { $m.sender } }
            $mProps = $m.PSObject.Properties.Name
            $text = ''
            if ($mProps -contains 'content') { $text = Get-PartText -Content $m.content }
            if ([string]::IsNullOrWhiteSpace($text) -and ($mProps -contains 'text')) { $text = $m.text }
            $text = ([string]$text).Trim()
            if ([string]::IsNullOrWhiteSpace($text)) { continue }
            $msgs.Add(@{ Role = $role; Text = $text })
        }
    }
    return , $msgs.ToArray()
}

function Get-ConvTitle {
    param($Conv, [string]$Fmt)
    $p = $Conv.PSObject.Properties.Name
    $t = if ($Fmt -eq 'claude' -and ($p -contains 'name')) { $Conv.name }
    elseif ($p -contains 'title') { $Conv.title }
    else { '' }
    if ([string]::IsNullOrWhiteSpace($t)) { $t = '(untitled conversation)' }
    return ([string]$t).Trim()
}

function Get-ConvDate {
    param($Conv, [string]$Fmt)
    try {
        if ($Fmt -eq 'claude' -and $Conv.created_at) {
            return ([datetimeoffset]::Parse($Conv.created_at)).ToString('yyyy-MM-dd')
        }
        if ($Fmt -eq 'chatgpt' -and $Conv.create_time) {
            return ([datetimeoffset]::FromUnixTimeSeconds([long][double]$Conv.create_time)).ToString('yyyy-MM-dd')
        }
    } catch { }
    return (Get-Date -Format 'yyyy-MM-dd')
}

function New-Slug {
    param([string]$Text)
    $s = ($Text -replace '[^\w\- ]', '' -replace '\s+', '_')
    if ($s.Length -gt 40) { $s = $s.Substring(0, 40) }
    if ([string]::IsNullOrWhiteSpace($s)) { $s = 'conversation' }
    return $s
}

# --- ingest loop --------------------------------------------------------------
$seen = Get-IndexHashes -Root $Root
$imported = 0; $skipped = 0; $empty = 0
$dateStr = Get-Date -Format 'yyyy-MM-dd'

foreach ($conv in $data) {
    try {
        $title = Get-ConvTitle -Conv $conv -Fmt $format
        $messages = Get-Messages -Conv $conv -Fmt $format
        if (@($messages).Count -eq 0) { $empty++; continue }

        # Build the transcript (cold archive).
        $sb = New-Object System.Text.StringBuilder
        [void]$sb.AppendLine("# $title")
        [void]$sb.AppendLine()
        foreach ($m in $messages) {
            [void]$sb.AppendLine("## $($m.Role)")
            [void]$sb.AppendLine()
            [void]$sb.AppendLine($m.Text)
            [void]$sb.AppendLine()
        }
        $transcript = $sb.ToString()
        $sha = Get-StringSha256 -Text $transcript

        if ($seen.ContainsKey($sha)) {
            Write-ActionLog -Root $Root -Level 'REVIEW' -Message "Duplicate conversation skipped (id=$($seen[$sha])): $title"
            $skipped++
            continue
        }

        $id = New-IngestId $sha
        $convDate = Get-ConvDate -Conv $conv -Fmt $format

        # Write transcript to _RAW (cold archive), never overwriting.
        $rawDir = Get-RawDir -Root $Root -Source $Source -DateStr $dateStr
        $rawFile = Join-Path $rawDir ("conv_{0}_{1}.md" -f (New-Slug $title), $id)
        if (-not (Test-Path -LiteralPath $rawFile)) {
            $utf8 = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText($rawFile, $transcript, $utf8)
            Write-ActionLog -Root $Root -Level 'CREATE' -Message "Archived transcript: $rawFile"
        }
        $rawRel = $rawFile.Substring($Root.Length).TrimStart('\', '/')

        # Extractive preview (deterministic, no LLM): first user ask + last reply.
        $firstUser = ($messages | Where-Object { $_.Role -eq 'user' } | Select-Object -First 1).Text
        $lastAsst  = ($messages | Where-Object { $_.Role -eq 'assistant' } | Select-Object -Last 1).Text
        function Clip { param($t, $n = 240) if (-not $t) { return '' }; $t = ($t -replace '\s+', ' ').Trim(); if ($t.Length -gt $n) { $t.Substring(0, $n - 1) + '…' } else { $t } }
        $preview = "**Asked:** $(Clip $firstUser)`n`n**Outcome:** $(Clip $lastAsst)"

        $rec = @{
            id                  = $id
            type                = 'conversation'
            source              = $Source
            project             = 'UNASSIGNED'
            title               = $title
            date_added          = $convDate
            sha256              = $sha
            bytes               = [System.Text.Encoding]::UTF8.GetByteCount($transcript)
            ext                 = '.md'
            contains            = ("{0} messages" -f @($messages).Count)
            purpose             = $preview
            status              = 'NEEDS_REVIEW'
            raw_path            = $rawRel
            original_path       = $Path
            source_ref          = $format
            needs_review_reason = 'unassigned project; summary pending audit'
        }
        $record = Add-IndexRecord -Root $Root -Record $rec
        Write-ConversationCard -Root $Root -Record $record | Out-Null
        $seen[$sha] = $id
        $imported++
    }
    catch {
        Write-ActionLog -Root $Root -Level 'WARN' -Message "Conversation ingest failed: $($_.Exception.Message)"
        Write-Warning "Failed a conversation: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Conversation ingestion complete." -ForegroundColor Green
Write-Host ("  Imported : {0}" -f $imported)
Write-Host ("  Duplicates skipped : {0}" -f $skipped)
if ($empty) { Write-Host ("  Empty/skipped : {0}" -f $empty) }
Write-Host ("  Index    : {0}" -f (Get-IndexPath -Root $Root))
Write-ActionLog -Root $Root -Level 'INFO' -Message "Import-Conversations ($format): $imported imported, $skipped duplicates, $empty empty"
