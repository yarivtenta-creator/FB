<#
.SYNOPSIS
    "Save Session" — capture the current AI work session into a project's memory.

.DESCRIPTION
    On each run it:
      1. Resolves / selects the project (creates the scaffold if new).
      2. Captures a session summary (argument, file, or interactive prompt).
      3. Writes a timestamped snapshot to 01_SESSIONS\SESSION_YYYY-MM-DD_HH-MM.md
      4. Updates STATE.md, TODO.md, DECISIONS.md, CHANGELOG.md,
         ASSET_INDEX.md and SESSION_LOG.md (each backed up before change).
      5. Stamps the traffic-light status: Green = saved, Yellow = pending,
         Red/Blocked = unsaved / blocked.

    Safety (Phase 8): originals are never deleted, every overwrite is backed up
    to _backups\, and every action is logged to _logs\actions.log.

.PARAMETER Project
    Project name. If omitted in interactive mode you'll be prompted (existing
    projects are listed; type a new name to create one).

.PARAMETER Summary
    The session summary text. If omitted, taken from -SummaryFile, else prompted.

.PARAMETER SummaryFile
    Path to a file whose contents become the session summary.

.PARAMETER Todo
    One or more new TODO items to append (also recorded in the snapshot).

.PARAMETER Decision
    A decision to record ("what|why" splits into decision/rationale).

.PARAMETER Change
    A CHANGELOG entry describing what changed this session.

.PARAMETER Asset
    An asset row to append to ASSET_INDEX.md: "name|contains|used for|path".

.PARAMETER SkillUsed
    One or more skills/modules used this session; each is logged to SKILLS_USED.md.

.PARAMETER NextAction
    The single most important next step.

.PARAMETER Status
    Override the resulting status: Green | Yellow | Red | Blocked.
    Default is Green (saved).

.PARAMETER BlockedReason
    Explanation used when Status is Red/Blocked.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.PARAMETER NonInteractive
    Never prompt. Requires -Project. Used for automation/testing.

.EXAMPLE
    .\Save-Session.ps1 -Project "Vinyl Lab" -Summary "Audited final ZIP" -Change "Marked vinyl_lab_FINAL_READY.zip as source of truth"

.EXAMPLE
    .\Save-Session.ps1        # fully interactive
#>
[CmdletBinding()]
param(
    [string]$Project,
    [string]$Summary,
    [string]$SummaryFile,
    [string[]]$Todo,
    [string]$Decision,
    [string]$Change,
    [string]$Asset,
    [string[]]$SkillUsed,
    [string]$NextAction,
    [ValidateSet('Green', 'Yellow', 'Red', 'Blocked')]
    [string]$Status = 'Green',
    [string]$BlockedReason,
    [string]$Root,
    [switch]$NonInteractive
)

. "$PSScriptRoot\common.ps1"

$Root = Get-MemoryRoot -Root $Root
$projectsRoot = Join-Path $Root 'Projects'
if (-not (Test-Path -LiteralPath $projectsRoot)) {
    New-Item -ItemType Directory -Path $projectsRoot -Force | Out-Null
}

# ---------------------------------------------------------------------------
# 1. Resolve project
# ---------------------------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Project)) {
    if ($NonInteractive) {
        throw "Project name is required in -NonInteractive mode. Pass -Project '<name>'."
    }
    $existing = @(Get-ChildItem -LiteralPath $projectsRoot -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    if ($existing.Count -gt 0) {
        Write-Host ""
        Write-Host "Existing projects:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $existing.Count; $i++) {
            Write-Host ("  [{0}] {1}" -f ($i + 1), $existing[$i])
        }
        Write-Host "  [n] New project"
        $choice = Read-Host "Select a number, or type a new project name"
        if ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $existing.Count) {
            $Project = $existing[[int]$choice - 1]
        }
        elseif ($choice -eq 'n' -or [string]::IsNullOrWhiteSpace($choice)) {
            $Project = Read-Host "New project name"
        }
        else {
            $Project = $choice
        }
    }
    else {
        $Project = Read-Host "No projects yet. New project name"
    }
}

$Project = $Project.Trim()
if ([string]::IsNullOrWhiteSpace($Project)) { throw "A project name is required." }

# ---------------------------------------------------------------------------
# 2. Ensure scaffold (idempotent, non-destructive)
# ---------------------------------------------------------------------------
$projectDir = & (Join-Path $PSScriptRoot 'New-Project.ps1') -Project $Project -Root $Root
$projectDir = [string]$projectDir
$currentDir = Join-Path $projectDir '00_CURRENT'

# ---------------------------------------------------------------------------
# 3. Gather the session summary
# ---------------------------------------------------------------------------
if ([string]::IsNullOrWhiteSpace($Summary) -and $SummaryFile) {
    if (-not (Test-Path -LiteralPath $SummaryFile)) { throw "SummaryFile not found: $SummaryFile" }
    $Summary = Read-TextFile -Path $SummaryFile
}
if ([string]::IsNullOrWhiteSpace($Summary)) {
    if ($NonInteractive) {
        $Summary = '(no summary provided)'
    }
    else {
        Write-Host ""
        Write-Host "Session summary (finish with an empty line):" -ForegroundColor Cyan
        $lines = @()
        while ($true) {
            $l = Read-Host
            if ([string]::IsNullOrWhiteSpace($l)) { break }
            $lines += $l
        }
        $Summary = ($lines -join "`n").Trim()
        if ([string]::IsNullOrWhiteSpace($Summary)) { $Summary = '(no summary provided)' }
    }
}

if ([string]::IsNullOrWhiteSpace($NextAction) -and -not $NonInteractive) {
    $NextAction = Read-Host "Next action (optional)"
}
if ([string]::IsNullOrWhiteSpace($NextAction)) { $NextAction = '(not set)' }

$statusCanonical = Resolve-Status $Status
if (($statusCanonical -eq 'RED' -or $statusCanonical -eq 'BLOCKED') -and [string]::IsNullOrWhiteSpace($BlockedReason) -and -not $NonInteractive) {
    $BlockedReason = Read-Host "Blocked reason"
}
if ([string]::IsNullOrWhiteSpace($BlockedReason)) { $BlockedReason = '(none)' }

# ---------------------------------------------------------------------------
# 4. Compose formatted blocks
# ---------------------------------------------------------------------------
$stamp = Get-TimeStamp          # 2026-07-03_14-30
$isoNow = Get-IsoNow           # 2026-07-03 14:30
$date = Get-Date -Format 'yyyy-MM-dd'
$statusEmoji = Get-StatusEmoji $statusCanonical
$statusMeaning = Get-StatusMeaning $statusCanonical

$todoBlock = if ($Todo) { ($Todo | ForEach-Object { "- [ ] $_" }) -join "`n" } else { '_none_' }

$decisionText = ''
$decisionRationale = ''
if ($Decision) {
    $parts = $Decision -split '\|', 2
    $decisionText = $parts[0].Trim()
    $decisionRationale = if ($parts.Count -gt 1) { $parts[1].Trim() } else { '' }
}
$decisionBlock = if ($Decision) { "- $decisionText$(if($decisionRationale){" — $decisionRationale"})" } else { '_none_' }
$changeBlock = if ($Change) { "- $Change" } else { '_none_' }

# Parse asset: name|contains|used for|path
$assetName = ''; $assetContains = ''; $assetUsed = ''; $assetPath = ''
if ($Asset) {
    $ap = $Asset -split '\|'
    $assetName = if ($ap.Count -gt 0) { $ap[0].Trim() } else { '' }
    $assetContains = if ($ap.Count -gt 1) { $ap[1].Trim() } else { '' }
    $assetUsed = if ($ap.Count -gt 2) { $ap[2].Trim() } else { '' }
    $assetPath = if ($ap.Count -gt 3) { $ap[3].Trim() } else { '' }
}
$assetBlock = if ($Asset) { "- **$assetName** — $assetContains ($assetUsed) [$assetPath]" } else { '_none_' }

# ---------------------------------------------------------------------------
# 5. Write the session snapshot
# ---------------------------------------------------------------------------
$snapshotName = "SESSION_$stamp.md"
$snapshotPath = Join-Path (Join-Path $projectDir '01_SESSIONS') $snapshotName
# Avoid clobbering a snapshot saved in the same minute.
if (Test-Path -LiteralPath $snapshotPath) {
    $suffix = 1
    do {
        $snapshotName = "SESSION_${stamp}_$suffix.md"
        $snapshotPath = Join-Path (Join-Path $projectDir '01_SESSIONS') $snapshotName
        $suffix++
    } while (Test-Path -LiteralPath $snapshotPath)
}

$snapTokens = @{
    PROJECT        = $Project
    TIMESTAMP      = $isoNow
    STATUS         = $statusCanonical
    STATUS_EMOJI   = $statusEmoji
    STATUS_MEANING = $statusMeaning
    SUMMARY        = $Summary
    TODO_ITEMS     = $todoBlock
    DECISIONS      = $decisionBlock
    CHANGES        = $changeBlock
    ASSETS         = $assetBlock
    NEXT_ACTION    = $NextAction
}
$snapTemplate = Read-TextFile -Path (Join-Path $PSScriptRoot 'templates\SESSION_SNAPSHOT.md')
Write-TextFile -Path $snapshotPath -Content (Expand-Template -Text $snapTemplate -Tokens $snapTokens) -Root $Root

# ---------------------------------------------------------------------------
# 6. Update the living memory files (each backed up before change)
# ---------------------------------------------------------------------------

# 6a. STATE.md — rewrite the snapshot header + summary.
$stateTokens = @{
    PROJECT        = $Project
    STATUS         = $statusCanonical
    STATUS_EMOJI   = $statusEmoji
    STATUS_MEANING = $statusMeaning
    LAST_SESSION   = "$isoNow ($snapshotName)"
    LAST_SAVED     = $isoNow
    BLOCKED_REASON = $BlockedReason
    NEXT_ACTION    = $NextAction
    SUMMARY        = $Summary
}
$stateTemplate = Read-TextFile -Path (Join-Path $PSScriptRoot 'templates\STATE.md')
Write-TextFile -Path (Join-Path $currentDir 'STATE.md') -Content (Expand-Template -Text $stateTemplate -Tokens $stateTokens) -Root $Root

# 6b. SESSION_LOG.md — prepend a row under the header.
$logPath = Join-Path $projectDir 'SESSION_LOG.md'
$logContent = Read-TextFile -Path $logPath
$summaryOneLine = ($Summary -replace '\r?\n', ' ')
if ($summaryOneLine.Length -gt 100) { $summaryOneLine = $summaryOneLine.Substring(0, 97) + '...' }
$logRow = "| $isoNow | $statusEmoji $statusCanonical | [$snapshotName](01_SESSIONS/$snapshotName) | $summaryOneLine |"
$logContent = Add-RowUnderTableHeader -Content $logContent -Row $logRow
Write-TextFile -Path $logPath -Content $logContent -Root $Root

# 6c. TODO.md — append any new items under "## Open".
if ($Todo) {
    $todoPath = Join-Path $currentDir 'TODO.md'
    $todoContent = Read-TextFile -Path $todoPath
    $newItems = ($Todo | ForEach-Object { "- [ ] $_" }) -join "`n"
    if ($todoContent -match '(?ms)(##\s+Open\s*\n)') {
        $todoContent = $todoContent -replace '(?ms)(##\s+Open\s*\n)', "`$1$newItems`n"
    }
    else {
        $todoContent = $todoContent.TrimEnd() + "`n$newItems`n"
    }
    Write-TextFile -Path $todoPath -Content $todoContent -Root $Root
}

# 6d. DECISIONS.md — append a table row.
if ($Decision) {
    $decPath = Join-Path $currentDir 'DECISIONS.md'
    $decContent = Read-TextFile -Path $decPath
    $decRow = "| $date | $decisionText | $decisionRationale |"
    $decContent = $decContent.TrimEnd() + "`n$decRow`n"
    Write-TextFile -Path $decPath -Content $decContent -Root $Root
}

# 6e. CHANGELOG.md — add an entry (newest first, grouped by date).
if ($Change) {
    $clPath = Join-Path $currentDir 'CHANGELOG.md'
    $clContent = Read-TextFile -Path $clPath
    if ($clContent -match [regex]::Escape("## $date")) {
        # Append bullet under today's existing heading.
        $clContent = $clContent -replace ("(?ms)(##\s+" + [regex]::Escape($date) + "\s*\n)"), "`$1- $Change`n"
    }
    else {
        # Insert a new date section right after the top-of-file blurb.
        $entry = "## $date`n- $Change`n"
        if ($clContent -match '(?ms)^(#.*?\n>.*?\n\n)') {
            $clContent = $clContent -replace '(?ms)^(#.*?\n>.*?\n\n)', "`$1$entry`n"
        }
        else {
            $clContent = $clContent.TrimEnd() + "`n`n$entry"
        }
    }
    Write-TextFile -Path $clPath -Content $clContent -Root $Root
}

# 6f. ASSET_INDEX.md — append a row if an asset was provided.
if ($Asset) {
    $aiPath = Join-Path $projectDir 'ASSET_INDEX.md'
    $aiContent = Read-TextFile -Path $aiPath
    $convMd = ''
    $aiRow = "| $assetName | $date | $assetContains | $assetUsed | NEEDS_REVIEW | $snapshotName | $assetPath | $convMd |"
    $aiContent = Add-RowUnderTableHeader -Content $aiContent -Row $aiRow
    Write-TextFile -Path $aiPath -Content $aiContent -Root $Root
}

# 6g. SKILLS_USED.md — append a row per skill/module used this session.
if ($SkillUsed) {
    $suPath = Join-Path $projectDir 'SKILLS_USED.md'
    $suContent = Read-TextFile -Path $suPath
    foreach ($skill in $SkillUsed) {
        $suRow = "| $isoNow | $skill | $snapshotName |  |"
        $suContent = Add-RowUnderTableHeader -Content $suContent -Row $suRow
    }
    Write-TextFile -Path $suPath -Content $suContent -Root $Root
}

# ---------------------------------------------------------------------------
# 7. Stamp status
# ---------------------------------------------------------------------------
$finalStatus = Set-ProjectStatus -ProjectDir $projectDir -Root $Root -Status $statusCanonical -Reason $BlockedReason
Write-ActionLog -Root $Root -Level 'INFO' -Message "Save Session complete for '$Project' -> $snapshotName ($finalStatus)"

# ---------------------------------------------------------------------------
# 8. Report
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "Session saved." -ForegroundColor Green
Write-Host ("  Project : {0}" -f $Project)
Write-Host ("  Status  : {0} {1} ({2})" -f $statusEmoji, $finalStatus, $statusMeaning)
Write-Host ("  Snapshot: {0}" -f $snapshotPath)
Write-Host ("  Updated : STATE.md, SESSION_LOG.md{0}{1}{2}{3}{4}" -f `
    $(if ($Todo) { ', TODO.md' } else { '' }), `
    $(if ($Decision) { ', DECISIONS.md' } else { '' }), `
    $(if ($Change) { ', CHANGELOG.md' } else { '' }), `
    $(if ($Asset) { ', ASSET_INDEX.md' } else { '' }), `
    $(if ($SkillUsed) { ', SKILLS_USED.md' } else { '' }))
Write-Host ("  Log     : {0}" -f (Join-Path (Join-Path $Root '_logs') 'actions.log')) -ForegroundColor DarkGray

return [pscustomobject]@{
    Project  = $Project
    Status   = $finalStatus
    Snapshot = $snapshotPath
    Root     = $Root
}
