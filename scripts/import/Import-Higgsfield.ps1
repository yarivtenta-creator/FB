<#
.SYNOPSIS
    Higgsfield adapter. Normalize AI generations (images / videos / audio) into
    canonical records, with the generation prompt as the asset's purpose.

.DESCRIPTION
    Emits canonical records only. Input is the JSON the Higgsfield API / MCP
    returns for generations/media: an array of objects (id, type/media_type,
    url, prompt, created_at, project). Each becomes an asset record with the
    media URL as its location (metadata only — media is not downloaded).

.PARAMETER Path
    JSON file: an array of generation objects (or {generations:[...]}/{items:[...]}).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Import-Higgsfield.ps1 -Path higgsfield_generations.json
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
foreach ($k in @('generations', 'items', 'medias', 'data')) {
    if ($data.PSObject.Properties.Name -contains $k) { $data = $data.$k; break }
}
if ($data -isnot [System.Array]) { $data = @($data) }

function Get-MediaType {
    param([string]$T)
    switch -Regex ($T.ToLowerInvariant()) {
        'image|img|png|jpg' { return 'image' }
        'video|mp4|mov'     { return 'video' }
        'audio|voice|sound' { return 'audio' }
        '3d|glb|mesh'       { return 'other' }
        default             { return 'image' }
    }
}

$seen = Get-IndexHashes -Root $Root
$imported = 0; $skipped = 0
foreach ($g in $data) {
    try {
        $props = $g.PSObject.Properties.Name
        $gid = if ($props -contains 'id') { [string]$g.id } else { '' }
        $mtRaw = if ($props -contains 'media_type') { [string]$g.media_type } elseif ($props -contains 'type') { [string]$g.type } else { 'image' }
        $url = if ($props -contains 'url') { [string]$g.url } elseif ($props -contains 'media_url') { [string]$g.media_url } else { '' }
        $prompt = if ($props -contains 'prompt') { [string]$g.prompt } else { '' }
        $proj = if ($props -contains 'project') { [string]$g.project } else { 'UNASSIGNED' }
        $date = (Get-Date -Format 'yyyy-MM-dd')
        if (($props -contains 'created_at') -and $g.created_at) { try { $date = ([datetimeoffset]::Parse($g.created_at)).ToString('yyyy-MM-dd') } catch { } }
        $title = if ($prompt) { $t = ($prompt -replace '\s+', ' ').Trim(); if ($t.Length -gt 60) { $t.Substring(0, 57) + '...' } else { $t } } else { "higgsfield_$gid" }
        $sha = Get-StringSha256 -Text ("higgsfield|$gid|$url")

        $rec = Add-CanonicalItem -Root $Root -Seen $seen -Record @{
            id = (New-IngestId $sha); type = (Get-MediaType $mtRaw); source = 'higgsfield'
            project = $proj; title = $title; date_added = $date; sha256 = $sha; ext = ''
            contains = "AI $mtRaw generation"; purpose = $prompt
            status = 'NEEDS_REVIEW'; raw_path = $url; original_path = $url
            source_ref = "higgsfield:$gid"; needs_review_reason = 'unassigned project'
        }
        if ($rec) { $imported++ } else { $skipped++ }
    }
    catch { Write-ActionLog -Root $Root -Level 'WARN' -Message "Higgsfield item failed: $($_.Exception.Message)" }
}

Write-Host ""
Write-Host "Higgsfield ingestion complete." -ForegroundColor Green
Write-Host ("  Imported : {0}   Duplicates : {1}" -f $imported, $skipped)
Write-ActionLog -Root $Root -Level 'INFO' -Message "Import-Higgsfield: $imported imported, $skipped dup"
