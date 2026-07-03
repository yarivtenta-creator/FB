<#
.SYNOPSIS
    Create (or repair) a project's memory folder structure. Idempotent and safe:
    it only creates what's missing and never overwrites an existing file.

.PARAMETER Project
    Project name (folder name under GPT-Memory\Projects\).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\New-Project.ps1 -Project "Vinyl Lab"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Project,
    [string]$Root
)

. "$PSScriptRoot\common.ps1"

$Root = Get-MemoryRoot -Root $Root
$projectDir = Get-ProjectDir -Root $Root -Project $Project
$templates = Join-Path $PSScriptRoot 'templates'

# Full folder structure (Phase 2). Empty folders get a .gitkeep so they persist.
$folders = @(
    '00_CURRENT',
    '01_SESSIONS',
    '02_ASSETS',
    '03_CONVERTED_MD',
    '04_IDEAS',
    '05_DONE',
    '06_BLOCKED',
    '07_CANCELLED',
    '08_ARCHIVE',
    '_backups'
)

$createdAnything = $false
foreach ($f in $folders) {
    $path = Join-Path $projectDir $f
    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-ActionLog -Root $Root -Level 'CREATE' -Message "Created folder '$path'"
        $createdAnything = $true
    }
}

$now = Get-IsoNow
$date = Get-Date -Format 'yyyy-MM-dd'
$tokens = @{
    PROJECT         = $Project
    DATE            = $date
    STATUS          = 'GREEN'
    STATUS_EMOJI    = Get-StatusEmoji 'GREEN'
    STATUS_MEANING  = Get-StatusMeaning 'GREEN'
    LAST_SESSION    = '(none yet)'
    LAST_SAVED      = '(never)'
    BLOCKED_REASON  = '(none)'
    NEXT_ACTION     = '(set on next Save Session)'
    SUMMARY         = '_No sessions saved yet._'
}

# Map: destination file  ->  template file
$currentDir = Join-Path $projectDir '00_CURRENT'
$fileMap = [ordered]@{
    (Join-Path $currentDir 'STATE.md')          = 'STATE.md'
    (Join-Path $currentDir 'TODO.md')           = 'TODO.md'
    (Join-Path $currentDir 'DECISIONS.md')      = 'DECISIONS.md'
    (Join-Path $currentDir 'CHANGELOG.md')      = 'CHANGELOG.md'
    (Join-Path $currentDir 'SOURCE_OF_TRUTH.md') = 'SOURCE_OF_TRUTH.md'
    (Join-Path $projectDir 'SESSION_LOG.md')    = 'SESSION_LOG.md'
    (Join-Path $projectDir 'ASSET_INDEX.md')    = 'ASSET_INDEX.md'
    (Join-Path $projectDir 'PROJECT_DASHBOARD.md') = 'PROJECT_DASHBOARD.md'
}

foreach ($dest in $fileMap.Keys) {
    $tpl = Join-Path $templates $fileMap[$dest]
    $content = Expand-Template -Text (Read-TextFile -Path $tpl) -Tokens $tokens
    $created = New-FileIfMissing -Path $dest -Content $content -Root $Root
    if ($created) { $createdAnything = $true }
}

# Ensure a status file exists (does not overwrite STATE.md content).
$statusFile = Join-Path $currentDir 'STATUS.txt'
if (-not (Test-Path -LiteralPath $statusFile)) {
    Set-ProjectStatus -ProjectDir $projectDir -Root $Root -Status 'GREEN' -Reason 'Project created' | Out-Null
}

# Final pass: drop a .gitkeep only into folders that are still empty, so the
# structure survives in git without littering populated folders.
foreach ($f in $folders) {
    $path = Join-Path $projectDir $f
    $hasContent = Get-ChildItem -LiteralPath $path -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne '.gitkeep' }
    $keep = Join-Path $path '.gitkeep'
    if (-not $hasContent) {
        if (-not (Test-Path -LiteralPath $keep)) { New-Item -ItemType File -Path $keep -Force | Out-Null }
    }
    elseif (Test-Path -LiteralPath $keep) {
        Remove-Item -LiteralPath $keep -Force   # our own marker only; never a user file
    }
}

if ($createdAnything) {
    Write-Host "Project scaffold ready: $projectDir" -ForegroundColor Green
}
else {
    Write-Host "Project already complete: $projectDir" -ForegroundColor DarkGray
}

# Return the project directory for callers/pipelines.
return $projectDir
