<#
.SYNOPSIS
    Google Drive adapter. Normalize Drive file METADATA into canonical records
    (metadata only — no file contents downloaded).

.DESCRIPTION
    Emits canonical records only. Input is the JSON the Drive API / Google Drive
    MCP returns: an array of file objects (id, name, mimeType, modifiedTime,
    size, webViewLink, parents). Each becomes an asset record with the Drive URL
    as its location. Nothing is copied to _RAW (there is no local original).

.PARAMETER Path
    JSON file containing an array of Drive file objects (or {files:[...]}).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Import-GDrive.ps1 -Path drive_files.json
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Path,
    [string]$Root
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
if (-not (Test-Path -LiteralPath $Path)) { throw "File not found: $Path" }
$data = Get-Content -LiteralPath $Path -Raw -Encoding utf8 | ConvertFrom-Json
if ($data.PSObject.Properties.Name -contains 'files') { $data = $data.files }
if ($data -isnot [System.Array]) { $data = @($data) }

function Get-TypeFromMime {
    param([string]$Mime)
    if (-not $Mime) { return 'other' }
    switch -Regex ($Mime) {
        'folder'                       { return 'folder' }
        'spreadsheet|excel'            { return 'spreadsheet' }
        'document|msword|wordprocess'  { return 'document' }
        'presentation|powerpoint'      { return 'document' }
        'pdf'                          { return 'pdf' }
        '^image/'                      { return 'image' }
        '^video/'                      { return 'video' }
        '^audio/'                      { return 'audio' }
        'zip|compressed'               { return 'archive' }
        'html'                         { return 'html' }
        'markdown'                     { return 'markdown' }
        'csv'                          { return 'csv' }
        '^text/'                       { return 'text' }
        default                        { return 'other' }
    }
}

$seen = Get-IndexHashes -Root $Root
$imported = 0; $skipped = 0
foreach ($f in $data) {
    try {
        $props = $f.PSObject.Properties.Name
        $fid = if ($props -contains 'id') { [string]$f.id } else { '' }
        $name = if ($props -contains 'name') { [string]$f.name } else { '(unnamed)' }
        $mime = if ($props -contains 'mimeType') { [string]$f.mimeType } else { '' }
        $url = if ($props -contains 'webViewLink') { [string]$f.webViewLink } else { "https://drive.google.com/file/d/$fid" }
        $date = (Get-Date -Format 'yyyy-MM-dd')
        if (($props -contains 'modifiedTime') -and $f.modifiedTime) { try { $date = ([datetimeoffset]::Parse($f.modifiedTime)).ToString('yyyy-MM-dd') } catch { } }
        $bytes = if (($props -contains 'size') -and $f.size) { [int64]$f.size } else { 0 }
        $sha = Get-StringSha256 -Text ("gdrive|$fid|$url")

        $rec = Add-CanonicalItem -Root $Root -Seen $seen -Record @{
            id = (New-IngestId $sha); type = (Get-TypeFromMime $mime); source = 'gdrive'
            project = 'UNASSIGNED'; title = $name; date_added = $date; sha256 = $sha
            ext = ([System.IO.Path]::GetExtension($name)).ToLowerInvariant(); bytes = $bytes
            contains = $mime; status = 'NEEDS_REVIEW'; raw_path = $url; original_path = $url
            source_ref = "gdrive:$fid"; needs_review_reason = 'unassigned project (Drive metadata only)'
        }
        if ($rec) { $imported++ } else { $skipped++ }
    }
    catch { Write-ActionLog -Root $Root -Level 'WARN' -Message "GDrive item failed: $($_.Exception.Message)" }
}

Write-Host ""
Write-Host "Google Drive ingestion complete." -ForegroundColor Green
Write-Host ("  Imported : {0}   Duplicates : {1}" -f $imported, $skipped)
Write-ActionLog -Root $Root -Level 'INFO' -Message "Import-GDrive: $imported imported, $skipped dup"
