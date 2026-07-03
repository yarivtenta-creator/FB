<#
.SYNOPSIS
    Files adapter (Phase 0 ingestion). Import ZIP / PDF / image / video / HTML /
    Markdown / DOC / CSV / text into the memory system: copy to _RAW, index, and
    write a Markdown card. Deterministic and non-destructive — no LLM.

.DESCRIPTION
    For each file it:
      1. Hashes (SHA-256) — exact duplicates are detected and skipped.
      2. Copies the original into _RAW\<source>\<date>\ (never moves/overwrites).
      3. Appends a canonical record to _INDEX\master_index.ndjson
         (project = UNASSIGNED, status = NEEDS_REVIEW until the audit routes it).
      4. Writes a human card to _INDEX\assets\<id>.md.

.PARAMETER Path
    File(s) or folder(s) to ingest. Folders are scanned recursively.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.PARAMETER Source
    Logical source label for _RAW grouping (default: 'files').

.PARAMETER Project
    Optionally pre-assign a project (skips UNASSIGNED). Use only when you are sure.

.PARAMETER Include
    Optional extension filter, e.g. -Include zip,pdf,png. Default: all files.

.EXAMPLE
    .\Import-Files.ps1 -Path "D:\Downloads" -Include zip,pdf

.EXAMPLE
    .\Import-Files.ps1 -Path "D:\Downloads\vinyl_lab_FINAL_READY.zip" -Project "Vinyl Lab"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string[]]$Path,
    [string]$Root,
    [string]$Source = 'files',
    [string]$Project,
    [string[]]$Include
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root

# Resolve the input paths into a flat list of files.
$files = New-Object System.Collections.Generic.List[string]
foreach ($p in $Path) {
    if (-not (Test-Path -LiteralPath $p)) {
        Write-Warning "Path not found, skipping: $p"
        continue
    }
    $item = Get-Item -LiteralPath $p
    if ($item.PSIsContainer) {
        Get-ChildItem -LiteralPath $p -File -Recurse -ErrorAction SilentlyContinue |
            ForEach-Object { $files.Add($_.FullName) }
    } else {
        $files.Add($item.FullName)
    }
}

if ($Include) {
    $wanted = $Include | ForEach-Object { $_.TrimStart('.').ToLowerInvariant() }
    $files = @($files | Where-Object {
        $wanted -contains ([System.IO.Path]::GetExtension($_).TrimStart('.').ToLowerInvariant())
    })
}

if (@($files).Count -eq 0) { Write-Host "No files to ingest." -ForegroundColor Yellow; return }

$seen = Get-IndexHashes -Root $Root
$imported = 0; $skipped = 0
$results = New-Object System.Collections.Generic.List[object]

foreach ($f in $files) {
    try {
        $fi = Get-Item -LiteralPath $f
        $sha = Get-Sha256 -Path $f

        if ($seen.ContainsKey($sha)) {
            Write-ActionLog -Root $Root -Level 'REVIEW' -Message "Duplicate skipped (sha match id=$($seen[$sha])): $f"
            $skipped++
            continue
        }

        $ext = $fi.Extension
        $type = Get-AssetType -Extension $ext
        $contains = ''
        if ($type -eq 'archive' -and $ext -match 'zip') { $contains = Get-ZipManifest -Path $f }

        $raw = Copy-ToRaw -Root $Root -SourceFile $f -Source $Source -Sha256 $sha
        $rawRel = $raw.Substring($Root.Length).TrimStart('\', '/')

        $reason = if ($Project) { '' } else { 'unassigned project' }
        $status = if ($Project) { 'INDEXED' } else { 'NEEDS_REVIEW' }

        $rec = @{
            id                  = (New-IngestId $sha)
            type                = $type
            source              = $Source
            project             = $(if ($Project) { $Project } else { 'UNASSIGNED' })
            title               = $fi.Name
            date_added          = $fi.LastWriteTime.ToString('yyyy-MM-dd')
            sha256              = $sha
            bytes               = [int64]$fi.Length
            ext                 = $ext.ToLowerInvariant()
            contains            = $contains
            status              = $status
            raw_path            = $rawRel
            original_path       = $f
            source_ref          = 'local'
            needs_review_reason = $reason
        }

        $record = Add-IndexRecord -Root $Root -Record $rec
        Write-AssetCard -Root $Root -Record $record | Out-Null
        $seen[$sha] = $record.id
        $imported++
        $results.Add([pscustomobject]@{ Id = $record.id; Type = $type; Title = $fi.Name; Convertible = (Test-Convertible $type) })
    }
    catch {
        Write-ActionLog -Root $Root -Level 'WARN' -Message "Ingest failed for '$f': $($_.Exception.Message)"
        Write-Warning "Failed: $f — $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Files ingestion complete." -ForegroundColor Green
Write-Host ("  Imported : {0}" -f $imported)
Write-Host ("  Duplicates skipped : {0}" -f $skipped)
Write-Host ("  Index    : {0}" -f (Get-IndexPath -Root $Root))
Write-ActionLog -Root $Root -Level 'INFO' -Message "Import-Files: $imported imported, $skipped duplicates skipped from $(@($files).Count) file(s)"

return $results
