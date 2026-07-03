<#
.SYNOPSIS
    Publish phase. Compile ALL projects, verify each one, measure hot-tier
    efficiency, and emit a validation report. Implementation/validation only —
    no architecture changes.

.DESCRIPTION
    1. Compiles every project + reserved bucket from canonical records.
    2. Verifies each project has clean Canonical Project Memory: the mandatory
       files, Active/Archived separation, Source of Truth, modules, generated
       outputs.
    3. Measures the hot-tier size (the always-in-context current-truth files)
       per project and estimates token reduction vs loading raw history.
    4. Writes _PUBLISH/VALIDATION_<date>.md summarizing everything.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Publish-Memory.ps1
#>
[CmdletBinding()]
param([string]$Root)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root

# --- 1. Compile everything ----------------------------------------------------
Write-Host "Publishing: compiling ALL projects..." -ForegroundColor Green
& (Join-Path $PSScriptRoot 'Compile-ProjectMemory.ps1') -Project ALL -Root $Root | Out-Null

# --- gather canonical state ---------------------------------------------------
$records = @(Get-EffectiveRecords -Root $Root)
$modules = @(Get-Modules -Root $Root)
$projectsRoot = Join-Path $Root 'Projects'
$projectNames = @(Get-ChildItem -LiteralPath $projectsRoot -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)

# hot-tier = the small "current truth" files always loaded into context.
$hotFiles = @(
    '00_CURRENT\STATE.md', 'PROJECT_INDEX.md', '00_CURRENT\SOURCE_OF_TRUTH.md', 'SKILLS_AVAILABLE.md'
)
$mandatory = @(
    '00_CURRENT\STATE.md', '00_CURRENT\TODO.md', '00_CURRENT\DECISIONS.md', '00_CURRENT\CHANGELOG.md',
    '00_CURRENT\SOURCE_OF_TRUTH.md', 'ASSET_INDEX.md', 'SKILLS_AVAILABLE.md', 'SKILLS_USED.md', 'PROJECT_INDEX.md'
)
function Get-Bytes { param($Path) if (Test-Path -LiteralPath $Path) { (Get-Item -LiteralPath $Path).Length } else { 0 } }
function To-Tokens { param([long]$Bytes) [math]::Round($Bytes / 4.0) }

# --- 2/3. per-project verification + hot-tier measurement ---------------------
$rows = @()
$totalHot = 0L; $totalCold = 0L
foreach ($name in ($projectNames | Sort-Object)) {
    $dir = Join-Path $projectsRoot $name
    $recs = @($records | Where-Object { $_.project -eq $name })
    $mods = @($modules | Where-Object { $_.project -eq $name })
    $archived = @($recs | Where-Object { $_.status -eq 'ARCHIVED' })
    $active = @($recs | Where-Object { $_.status -ne 'ARCHIVED' })

    # verification checks
    $missing = @($mandatory | Where-Object { -not (Test-Path -LiteralPath (Join-Path $dir $_)) })
    $piPath = Join-Path $dir 'PROJECT_INDEX.md'
    $piText = if (Test-Path -LiteralPath $piPath) { Get-Content -LiteralPath $piPath -Raw -Encoding utf8 } else { '' }
    $hasArchiveSep = ($archived.Count -eq 0) -or ($piText -match 'Archived')
    $hasModules = ($mods.Count -eq 0) -or ($piText -match 'Modules')
    $hasSoT = Test-Path -LiteralPath (Join-Path $dir '00_CURRENT\SOURCE_OF_TRUTH.md')
    $ok = ($missing.Count -eq 0) -and $hasArchiveSep -and $hasModules -and $hasSoT

    # hot tier
    $hotBytes = 0L; foreach ($h in $hotFiles) { $hotBytes += Get-Bytes (Join-Path $dir $h) }
    # cold tier = raw history this project would otherwise load (local _RAW files)
    $coldBytes = 0L
    foreach ($r in $recs) {
        if ($r.raw_path -and ($r.raw_path -notmatch '^https?://')) {
            $coldBytes += Get-Bytes (Join-Path $Root $r.raw_path)
        }
    }
    $totalHot += $hotBytes; $totalCold += $coldBytes

    $rows += [pscustomobject]@{
        Project = $name; Records = $recs.Count; Active = $active.Count; Archived = $archived.Count
        Modules = $mods.Count; HotBytes = $hotBytes; HotTokens = (To-Tokens $hotBytes)
        ColdTokens = (To-Tokens $coldBytes); Verified = $(if ($ok) { 'PASS' } else { "FAIL ($($missing -join ',') )" })
    }
}

# --- aggregate metrics --------------------------------------------------------
$unclassified = @($records | Where-Object { $_.project -eq 'UNCLASSIFIED' })
$unassigned = @($records | Where-Object { $_.project -eq 'UNASSIGNED' })
$mergedDupes = 0; foreach ($m in $modules) { $mergedDupes += @($m.members).Count }
$archivedTotal = @($records | Where-Object { $_.status -eq 'ARCHIVED' }).Count

# pending operator approvals = queued candidates not yet ARCHIVED
$auditDir = Join-Path $Root '_AUDIT'
$pending = 0
if (Test-Path -LiteralPath $auditDir) {
    $assignedArchived = @($records | Where-Object { $_.status -eq 'ARCHIVED' } | ForEach-Object { $_.id })
    Get-ChildItem -LiteralPath $auditDir -Filter 'queue_*.ndjson' -File -ErrorAction SilentlyContinue | ForEach-Object {
        Get-Content -LiteralPath $_.FullName -Encoding utf8 | ForEach-Object {
            if ([string]::IsNullOrWhiteSpace($_)) { return }
            try { $q = $_ | ConvertFrom-Json; if ($assignedArchived -notcontains $q.id) { $pending++ } } catch { }
        }
    }
}
$unresolved = $unassigned.Count + $pending

$overallReduction = if ($totalCold -gt 0) { [math]::Round((1 - ($totalHot / [double]($totalHot + $totalCold))) * 100, 1) } else { 0 }

# Projection: real conversation histories are far larger than this sample's.
# Estimate cold at a representative ~1,500 tokens per conversation record.
$convCount = @($records | Where-Object { $_.type -eq 'conversation' }).Count
$projCold = $convCount * 1500
$projReduction = if (($totalHot + $projCold) -gt 0) { [math]::Round((1 - ($totalHot / [double]($totalHot + $projCold))) * 100, 1) } else { 0 }

# --- validation report --------------------------------------------------------
$pubDir = Join-Path $Root '_PUBLISH'
if (-not (Test-Path -LiteralPath $pubDir)) { New-Item -ItemType Directory -Path $pubDir -Force | Out-Null }
$dateStr = Get-Date -Format 'yyyy-MM-dd'
$rep = New-Object System.Text.StringBuilder
[void]$rep.AppendLine("# PUBLISH VALIDATION — $dateStr")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Summary")
[void]$rep.AppendLine("| Metric | Value |")
[void]$rep.AppendLine("|--------|-------|")
[void]$rep.AppendLine("| Total projects | $($projectNames.Count) |")
[void]$rep.AppendLine("| Total records | $($records.Count) |")
[void]$rep.AppendLine("| Modules (consolidated) | $($modules.Count) |")
[void]$rep.AppendLine("| Merged duplicates (archived into modules) | $mergedDupes |")
[void]$rep.AppendLine("| Archived history (records) | $archivedTotal |")
[void]$rep.AppendLine("| Unresolved (UNASSIGNED + pending approvals) | $unresolved  (unassigned $($unassigned.Count), pending $pending) |")
[void]$rep.AppendLine("| UNCLASSIFIED items | $($unclassified.Count) |")
[void]$rep.AppendLine("| Hot-tier total | $(To-Tokens $totalHot) tok (~$totalHot bytes) |")
[void]$rep.AppendLine("| Cold history total | $(To-Tokens $totalCold) tok (~$totalCold bytes) |")
[void]$rep.AppendLine("| Overall token reduction (this sample) | $overallReduction% (hot vs hot+cold; sample history is tiny) |")
[void]$rep.AppendLine("| **Projected reduction (real history)** | **$projReduction%** (at ~1,500 tok/conversation × $convCount) |")
[void]$rep.AppendLine()
[void]$rep.AppendLine("> The hot tier ($(To-Tokens $totalHot) tok) is loaded every turn instead of re-reading raw")
[void]$rep.AppendLine("> history. In this sample the archived transcripts are tiny; with real")
[void]$rep.AppendLine("> conversation histories the cold tier dominates and the reduction approaches the projected figure.")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Per-project")
[void]$rep.AppendLine("| Project | Records | Active | Archived | Modules | Hot (tok) | Cold (tok) | Verified |")
[void]$rep.AppendLine("|---------|---------|--------|----------|---------|-----------|-----------|----------|")
foreach ($r in $rows) {
    [void]$rep.AppendLine("| $($r.Project) | $($r.Records) | $($r.Active) | $($r.Archived) | $($r.Modules) | $($r.HotTokens) | $($r.ColdTokens) | $($r.Verified) |")
}
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Buckets")
[void]$rep.AppendLine("- UNASSIGNED (awaiting audit): $($unassigned.Count)")
[void]$rep.AppendLine("- UNCLASSIFIED (uncertain, parked): $($unclassified.Count)")
[void]$rep.AppendLine()
$allPass = @($rows | Where-Object { $_.Verified -ne 'PASS' }).Count -eq 0
[void]$rep.AppendLine("## Result: $(if ($allPass) { 'ALL PROJECTS VERIFIED — PUBLISH OK' } else { 'VERIFICATION FAILURES — see table' })")

$reportPath = Join-Path $pubDir "VALIDATION_$dateStr.md"
Write-TextFile -Path $reportPath -Content $rep.ToString() -Root $Root

# --- console summary ----------------------------------------------------------
Write-Host ""
Write-Host "PUBLISH VALIDATION" -ForegroundColor Green
$rows | Format-Table Project, Records, Active, Archived, Modules, HotTokens, ColdTokens, Verified -AutoSize | Out-Host
Write-Host ("  Projects: {0}   Records: {1}   Modules: {2}   MergedDupes: {3}" -f $projectNames.Count, $records.Count, $modules.Count, $mergedDupes)
Write-Host ("  Archived: {0}   UNCLASSIFIED: {1}   Unresolved: {2}" -f $archivedTotal, $unclassified.Count, $unresolved)
Write-Host ("  Hot: {0} tok   Cold: {1} tok   Reduction: {2}% (sample)   Projected: {3}%" -f (To-Tokens $totalHot), (To-Tokens $totalCold), $overallReduction, $projReduction)
Write-Host ("  Report: {0}" -f $reportPath)
Write-Host ("  Result: {0}" -f $(if ($allPass) { 'ALL VERIFIED — PUBLISH OK' } else { 'FAILURES PRESENT' })) -ForegroundColor $(if ($allPass) { 'Green' } else { 'Yellow' })
Write-ActionLog -Root $Root -Level 'INFO' -Message "Publish: projects=$($projectNames.Count) records=$($records.Count) modules=$($modules.Count) reduction=$overallReduction% pass=$allPass"

return [pscustomobject]@{ Projects = $projectNames.Count; Records = $records.Count; Reduction = $overallReduction; Pass = $allPass; Report = $reportPath }
