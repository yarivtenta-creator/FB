<#
.SYNOPSIS
    "Save Session" — capture the current AI work session as a SessionDelta.

.DESCRIPTION
    Ownership model (final): Save-Session EMITS a SessionDelta (+ canonical asset
    records) ONLY. It never writes generated project files. The Compiler owns and
    generates STATE.md, TODO.md, SOURCE_OF_TRUTH.md, ASSET_INDEX.md,
    PROJECT_INDEX.md, DECISIONS.md, CHANGELOG.md, SESSION_LOG.md, SKILLS_USED.md
    and the per-session snapshot pages.

    On each run it:
      1. Resolves / selects the project (scaffolds folders if new).
      2. Gathers session inputs (summary, todos, decision, change, next action,
         status, assets, skills, source-of-truth).
      3. Appends ONE SessionDelta to _INDEX\session_deltas.ndjson (append-only).
      4. Feeds any -Asset as a canonical record to the master index.
      5. Invokes the Compiler to (re)generate the project's memory files.

    Safety: append-only inputs; the Compiler backs up every generated file before
    overwriting; every action is logged.

.PARAMETER Project
    Project name. If omitted in interactive mode you'll be prompted.

.PARAMETER Summary
    Session summary. If omitted, taken from -SummaryFile, else prompted.

.PARAMETER SummaryFile
    Path to a file whose contents become the session summary.

.PARAMETER Todo
    New TODO items to add.

.PARAMETER TodoDone
    TODO items completed this session (matched by text; moved to Done).

.PARAMETER Decision
    A decision to record ("what|why" splits into decision/rationale).

.PARAMETER Change
    A CHANGELOG entry describing what changed this session.

.PARAMETER Asset
    An asset to feed to the index: "name|contains|used for|path".

.PARAMETER SourceOfTruth
    Authoritative item(s): "item|path|note" — rendered into SOURCE_OF_TRUTH.md.

.PARAMETER SkillUsed
    Skills/modules used this session.

.PARAMETER NextAction
    The single most important next step.

.PARAMETER Status
    Resulting status: Green | Yellow | Red | Blocked. Default Green.

.PARAMETER BlockedReason
    Explanation used when Status is Red/Blocked.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.PARAMETER NoCompile
    Emit the delta but skip the compile step (compile later with Compile-ProjectMemory).

.PARAMETER NonInteractive
    Never prompt. Requires -Project.

.EXAMPLE
    .\Save-Session.ps1 -Project "Vinyl Lab" -Summary "Audited final ZIP" -Change "Marked zip as source of truth"
#>
[CmdletBinding()]
param(
    [string]$Project,
    [string]$Summary,
    [string]$SummaryFile,
    [string[]]$Todo,
    [string[]]$TodoDone,
    [string]$Decision,
    [string]$Change,
    [string]$Asset,
    [string[]]$SourceOfTruth,
    [string[]]$SkillUsed,
    [string]$NextAction,
    [ValidateSet('Green', 'Yellow', 'Red', 'Blocked')]
    [string]$Status = 'Green',
    [string]$BlockedReason,
    [string]$Root,
    [switch]$NoCompile,
    [switch]$NonInteractive
)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
$projectsRoot = Join-Path $Root 'Projects'
if (-not (Test-Path -LiteralPath $projectsRoot)) { New-Item -ItemType Directory -Path $projectsRoot -Force | Out-Null }

# --- 1. Resolve project -------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Project)) {
    if ($NonInteractive) { throw "Project name is required in -NonInteractive mode. Pass -Project '<name>'." }
    $existing = @(Get-ChildItem -LiteralPath $projectsRoot -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    if ($existing.Count -gt 0) {
        Write-Host ""; Write-Host "Existing projects:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $existing.Count; $i++) { Write-Host ("  [{0}] {1}" -f ($i + 1), $existing[$i]) }
        Write-Host "  [n] New project"
        $choice = Read-Host "Select a number, or type a new project name"
        if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $existing.Count) { $Project = $existing[[int]$choice - 1] }
        elseif ($choice -eq 'n' -or [string]::IsNullOrWhiteSpace($choice)) { $Project = Read-Host "New project name" }
        else { $Project = $choice }
    }
    else { $Project = Read-Host "No projects yet. New project name" }
}
$Project = $Project.Trim()
if ([string]::IsNullOrWhiteSpace($Project)) { throw "A project name is required." }

# --- 2. Ensure scaffold (folders + mandatory files) ---------------------------
$projectDir = [string](& (Join-Path $PSScriptRoot 'New-Project.ps1') -Project $Project -Root $Root)

# --- 3. Gather inputs ---------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Summary) -and $SummaryFile) {
    if (-not (Test-Path -LiteralPath $SummaryFile)) { throw "SummaryFile not found: $SummaryFile" }
    $Summary = Read-TextFile -Path $SummaryFile
}
if ([string]::IsNullOrWhiteSpace($Summary)) {
    if ($NonInteractive) { $Summary = '(no summary provided)' }
    else {
        Write-Host ""; Write-Host "Session summary (finish with an empty line):" -ForegroundColor Cyan
        $lines = @()
        while ($true) { $l = Read-Host; if ([string]::IsNullOrWhiteSpace($l)) { break }; $lines += $l }
        $Summary = ($lines -join "`n").Trim()
        if ([string]::IsNullOrWhiteSpace($Summary)) { $Summary = '(no summary provided)' }
    }
}
if ([string]::IsNullOrWhiteSpace($NextAction) -and -not $NonInteractive) { $NextAction = Read-Host "Next action (optional)" }
if ([string]::IsNullOrWhiteSpace($NextAction)) { $NextAction = '(not set)' }

$statusCanonical = Resolve-Status $Status
if (($statusCanonical -in @('RED', 'BLOCKED')) -and [string]::IsNullOrWhiteSpace($BlockedReason) -and -not $NonInteractive) {
    $BlockedReason = Read-Host "Blocked reason"
}
if ([string]::IsNullOrWhiteSpace($BlockedReason)) { $BlockedReason = '(none)' }

$stamp = Get-TimeStamp
$isoNow = Get-IsoNow
$date = Get-Date -Format 'yyyy-MM-dd'

# Decision -> {text, rationale}
$decisionObj = $null
if ($Decision) {
    $parts = $Decision -split '\|', 2
    $decisionObj = @{ text = $parts[0].Trim(); rationale = if ($parts.Count -gt 1) { $parts[1].Trim() } else { '' } }
}

# Asset -> canonical record (fed to master index), remember its id for the delta.
$assetIds = @()
if ($Asset) {
    $ap = $Asset -split '\|'
    $assetName = if ($ap.Count -gt 0) { $ap[0].Trim() } else { '' }
    $assetContains = if ($ap.Count -gt 1) { $ap[1].Trim() } else { '' }
    $assetUsed = if ($ap.Count -gt 2) { $ap[2].Trim() } else { '' }
    $assetPath = if ($ap.Count -gt 3) { $ap[3].Trim() } else { '' }
    $assetSha = Get-StringSha256 -Text ("$assetName|$assetPath")
    $assetId = New-IngestId $assetSha
    Add-IndexRecord -Root $Root -Record @{
        id = $assetId; type = (Get-AssetType -Extension ([System.IO.Path]::GetExtension($assetName)))
        source = 'session'; project = $Project; title = $assetName; date_added = $date
        sha256 = $assetSha; ext = ([System.IO.Path]::GetExtension($assetName)).ToLowerInvariant()
        contains = $assetContains; purpose = $assetUsed; status = 'CLASSIFIED'
        raw_path = $assetPath; original_path = $assetPath; related_sessions = @("SESSION_$stamp.md")
        source_ref = 'save-session'; needs_review_reason = ''
    } | Out-Null
    $assetIds += $assetId
}

# SourceOfTruth -> [{item, path, note}]
$sotList = @()
foreach ($s in $SourceOfTruth) {
    $sp = $s -split '\|'
    $sotList += @{ item = ($sp[0]).Trim(); path = $(if ($sp.Count -gt 1) { $sp[1].Trim() } else { '' }); note = $(if ($sp.Count -gt 2) { $sp[2].Trim() } else { '' }) }
}

# --- 4. Emit the SessionDelta -------------------------------------------------
$delta = @{
    project        = $Project
    ts             = $isoNow
    date           = $date
    snapshot       = "SESSION_$stamp.md"
    summary        = $Summary
    todos_added    = @($Todo)
    todos_done     = @($TodoDone)
    decision       = $decisionObj
    change         = $Change
    next_action    = $NextAction
    status         = $statusCanonical
    blocked_reason = $BlockedReason
    skills_used    = @($SkillUsed)
    source_of_truth = $sotList
    assets         = $assetIds
}
$delta = Add-SessionDelta -Root $Root -Delta $delta

# --- 5. Compile (the Compiler owns all generated files) -----------------------
if (-not $NoCompile) {
    & (Join-Path $PSScriptRoot 'Compile-ProjectMemory.ps1') -Project $Project -Root $Root | Out-Null
}

# --- 6. Report ----------------------------------------------------------------
Write-Host ""
Write-Host "Session saved (SessionDelta emitted)." -ForegroundColor Green
Write-Host ("  Project : {0}" -f $Project)
Write-Host ("  Status  : {0} {1} ({2})" -f (Get-StatusEmoji $statusCanonical), $statusCanonical, (Get-StatusMeaning $statusCanonical))
Write-Host ("  Snapshot: {0}" -f $delta.snapshot)
Write-Host ("  Delta   : {0}" -f (Get-SessionDeltasPath -Root $Root)) -ForegroundColor DarkGray
if ($NoCompile) { Write-Host "  Note    : -NoCompile set; run Compile-ProjectMemory to regenerate files." -ForegroundColor DarkGray }
else { Write-Host "  Compiled: STATE, TODO, SOURCE_OF_TRUTH, DECISIONS, CHANGELOG, SESSION_LOG, SKILLS_USED, ASSET_INDEX, PROJECT_INDEX" -ForegroundColor DarkGray }
Write-ActionLog -Root $Root -Level 'INFO' -Message "Save Session (delta) for '$Project' -> $($delta.snapshot) ($statusCanonical)"

return [pscustomobject]@{ Project = $Project; Status = $statusCanonical; Snapshot = $delta.snapshot; Root = $Root }
