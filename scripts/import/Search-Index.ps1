<#
.SYNOPSIS
    Query the ingestion index (Phase 0 retrieval). Answers "where is X?" from the
    structured index — returning a path + description, NOT conversation history.
    This is the token-saving lookup: it never loads transcripts.

.PARAMETER Query
    Free-text keyword matched against title / contains / purpose / project.

.PARAMETER Type
    Filter by asset type (archive, image, pdf, video, html, markdown, ...).

.PARAMETER Project
    Filter by project (including 'UNASSIGNED').

.PARAMETER Since
    Only items added on/after this date (yyyy-MM-dd).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Search-Index.ps1 -Query "homepage" -Type image

.EXAMPLE
    .\Search-Index.ps1 -Query "final website" -Type archive
#>
[CmdletBinding()]
param(
    [string]$Query,
    [string]$Type,
    [string]$Project,
    [string]$Since,
    [string]$Root
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
$indexPath = Get-IndexPath -Root $Root
if (-not (Test-Path -LiteralPath $indexPath)) { Write-Host "No index yet. Ingest something first." -ForegroundColor Yellow; return }

$records = Get-Content -LiteralPath $indexPath -Encoding utf8 |
    Where-Object { $_ -and $_.Trim() } |
    ForEach-Object { try { $_ | ConvertFrom-Json } catch { } }

$results = $records | Where-Object {
    $ok = $true
    if ($Type    -and $_.type    -ne $Type)    { $ok = $false }
    if ($Project -and $_.project -ne $Project) { $ok = $false }
    if ($Since   -and $_.date_added -lt $Since) { $ok = $false }
    if ($Query) {
        $hay = @($_.title, $_.contains, $_.purpose, $_.project) -join ' '
        if ($hay -notmatch [regex]::Escape($Query)) { $ok = $false }
    }
    $ok
}

$found = @($results)
if ($found.Count -eq 0) { Write-Host "No matches." -ForegroundColor Yellow; return }

Write-Host ("{0} match(es):" -f $found.Count) -ForegroundColor Green
foreach ($r in $found) {
    $isUrl = ($r.raw_path -match '^https?://')
    $where = if ($isUrl) { '(external)' } elseif (Test-Path -LiteralPath (Join-Path $Root $r.raw_path)) { '(exists)' } else { '(MISSING)' }
    Write-Host ""
    Write-Host ("  {0}  [{1}]" -f $r.title, $r.type) -ForegroundColor Cyan
    Write-Host ("    project : {0}   status : {1}   source : {2}" -f $r.project, $r.status, $r.source)
    if ($r.contains) { Write-Host ("    contains: {0}" -f $r.contains) }
    if ($r.purpose)  { Write-Host ("    purpose : {0}" -f $r.purpose) }
    Write-Host ("    path    : {0}  {1}" -f $r.raw_path, $where)
    if ($r.related_sessions -and @($r.related_sessions).Count) {
        Write-Host ("    sessions: {0}" -f ($r.related_sessions -join ', '))
    }
}

# Return objects for scripting/piping too.
return $found | Select-Object id, type, project, title, status, raw_path, date_added
