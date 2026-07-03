<#
.SYNOPSIS
    Run the mandatory 5-step pre-answer protocol for a project and print the
    context you must load BEFORE answering any request.

.DESCRIPTION
    Steps enforced:
      1. Identify project.
      2. Check available skills (SKILLS_AVAILABLE.md + master Skills Library).
      3. Check if similar work already exists (searches SESSION_LOG / DECISIONS
         / SKILLS_USED and, optionally, a -Query keyword).
      4. Check project state (STATE.md / STATUS.txt).
      5. (You then answer, informed by the above.)

    Read-only: it never writes to project files (only appends to the action log).

.PARAMETER Project
    Project name. Omit to pick from a list.

.PARAMETER Query
    Optional keyword to scan existing sessions/decisions/skills for prior work.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Get-ProjectContext.ps1 -Project "Vinyl Lab" -Query "deploy"
#>
[CmdletBinding()]
param(
    [string]$Project,
    [string]$Query,
    [string]$Root
)

. "$PSScriptRoot\common.ps1"

$Root = Get-MemoryRoot -Root $Root
$projectsRoot = Join-Path $Root 'Projects'

# --- Step 1: identify project -------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Project)) {
    $existing = @(Get-ChildItem -LiteralPath $projectsRoot -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    if ($existing.Count -eq 0) { throw "No projects found under $projectsRoot." }
    Write-Host "Projects:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $existing.Count; $i++) { Write-Host ("  [{0}] {1}" -f ($i + 1), $existing[$i]) }
    $choice = Read-Host "Select a number or type a name"
    if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $existing.Count) {
        $Project = $existing[[int]$choice - 1]
    } else { $Project = $choice }
}
$Project = $Project.Trim()
$projectDir = Get-ProjectDir -Root $Root -Project $Project
if (-not (Test-Path -LiteralPath $projectDir)) {
    throw "Project '$Project' not found. Create it with New-Project.ps1 first."
}
$currentDir = Join-Path $projectDir '00_CURRENT'

function Write-Section { param([string]$Title) ; Write-Host ""; Write-Host "== $Title ==" -ForegroundColor Cyan }

Write-Host ""
Write-Host "PRE-ANSWER PROTOCOL — $Project" -ForegroundColor Green
Write-Host ("Project path: {0}" -f $projectDir) -ForegroundColor DarkGray

# --- Step 1 output ------------------------------------------------------------
Write-Section "1. Project"
Write-Host "  $Project"

# --- Step 2: available skills -------------------------------------------------
Write-Section "2. Skills available (never skip the Skills Library)"
$skillsFile = Join-Path $projectDir 'SKILLS_AVAILABLE.md'
if (Test-Path -LiteralPath $skillsFile) {
    (Read-TextFile -Path $skillsFile) -split "`r?`n" |
        Where-Object { $_ -match '^\|' -and $_ -notmatch '^\|[\s\-:]+\|' } |
        Select-Object -First 12 | ForEach-Object { Write-Host "  $_" }
} else { Write-Host "  (SKILLS_AVAILABLE.md missing — run New-Project.ps1)" -ForegroundColor Yellow }
$libFile = Join-Path (Join-Path $Root '_SKILLS') 'SKILLS_LIBRARY.md'
if (Test-Path -LiteralPath $libFile) { Write-Host ("  Master library: {0}" -f $libFile) -ForegroundColor DarkGray }

# --- Step 3: similar existing work -------------------------------------------
Write-Section "3. Similar work already exists?"
$scanTargets = @(
    (Join-Path $projectDir 'SESSION_LOG.md'),
    (Join-Path $currentDir 'DECISIONS.md'),
    (Join-Path $currentDir 'TODO.md'),
    (Join-Path $currentDir 'STATE.md'),
    (Join-Path $projectDir 'SKILLS_USED.md')
)
# Include every session snapshot — that's where the real prior work is recorded.
$sessionsDir = Join-Path $projectDir '01_SESSIONS'
if (Test-Path -LiteralPath $sessionsDir) {
    $scanTargets += (Get-ChildItem -LiteralPath $sessionsDir -Filter '*.md' -File -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty FullName)
}
if ([string]::IsNullOrWhiteSpace($Query)) {
    Write-Host "  (no -Query given) Recent sessions:"
    $log = Read-TextFile -Path (Join-Path $projectDir 'SESSION_LOG.md')
    ($log -split "`r?`n" | Where-Object { $_ -match '^\| \d{4}-' } | Select-Object -First 5) |
        ForEach-Object { Write-Host "  $_" }
} else {
    $hits = 0
    foreach ($t in $scanTargets) {
        if (-not (Test-Path -LiteralPath $t)) { continue }
        $matches = Select-String -LiteralPath $t -Pattern $Query -SimpleMatch -ErrorAction SilentlyContinue
        foreach ($m in $matches) {
            Write-Host ("  [{0}:{1}] {2}" -f (Split-Path -Leaf $t), $m.LineNumber, $m.Line.Trim())
            $hits++
        }
    }
    if ($hits -eq 0) { Write-Host "  No prior work found matching '$Query'." -ForegroundColor Yellow }
    else { Write-Host ("  {0} match(es) for '{1}' — review before starting new work." -f $hits, $Query) }
}

# --- Step 4: project state ----------------------------------------------------
Write-Section "4. Project state"
$statusFile = Join-Path $currentDir 'STATUS.txt'
if (Test-Path -LiteralPath $statusFile) {
    (Read-TextFile -Path $statusFile) -split "`r?`n" | Where-Object { $_ } | ForEach-Object { Write-Host "  $_" }
}
$state = Read-TextFile -Path (Join-Path $currentDir 'STATE.md')
($state -split "`r?`n" | Where-Object { $_ -match '^\-\s+\*\*' } | Select-Object -First 6) |
    ForEach-Object { Write-Host "  $_" }

# --- Step 5 -------------------------------------------------------------------
Write-Section "5. Now answer — informed by the above"
Write-Host "  Context loaded. Proceed." -ForegroundColor Green

Write-ActionLog -Root $Root -Level 'INFO' -Message "Pre-answer protocol run for '$Project'$(if($Query){" (query: $Query)"})"
