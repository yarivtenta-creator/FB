<#
.SYNOPSIS
    Foundation Validation Suite. Stress-tests the foundation with real-world
    scenarios BEFORE any UI is built. Generates synthetic data at scale, runs
    five scenarios, times everything, asserts pass/fail, and emits a report.

.DESCRIPTION
    Scenarios:
      1. Large project      — thousands of conversations + assets; hot-tier budget + compile time.
      2. Multi-engine       — same content via ChatGPT/Claude → identical canonical record (dedup).
      3. Duplicate stress   — hundreds of similar ideas → deterministic merge, explainability, queue.
      4. Recovery           — recompile is reproducible; re-ingest of raw history is idempotent.
      5. Performance report — compile/publish time, hot-tier, archive growth, dup + token reduction, footprint.

.PARAMETER Conversations
    Conversations for the large-project scenario (default 2000).

.PARAMETER Assets
    Assets (Drive metadata) for the large-project scenario (default 2000).

.PARAMETER Ideas
    Similar ideas for the duplicate stress scenario (default 300).

.PARAMETER Root
    Scratch memory root for the suite (default: a temp folder under the repo).

.EXAMPLE
    .\Test-Foundation.ps1 -Conversations 2000 -Assets 2000 -Ideas 300
#>
[CmdletBinding()]
param(
    [int]$Conversations = 2000,
    [int]$Assets = 2000,
    [int]$Ideas = 300,
    [string]$Root
)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

if (-not $Root) { $Root = Join-Path (Split-Path -Parent $PSScriptRoot) 'GPT-Memory-VALIDATION' }
if (Test-Path -LiteralPath $Root) { Remove-Item -LiteralPath $Root -Recurse -Force }
New-Item -ItemType Directory -Path $Root -Force | Out-Null
$Root = (Resolve-Path -LiteralPath $Root).Path
$gen = Join-Path $Root '_gen'; New-Item -ItemType Directory -Path $gen -Force | Out-Null

$sw = [System.Diagnostics.Stopwatch]
function Time-It { param([scriptblock]$Block) $s = $sw::StartNew(); & $Block | Out-Null; $s.Stop(); return [math]::Round($s.Elapsed.TotalSeconds, 2) }
$results = @()   # @{ Scenario; Pass; Detail }
function Assert-Scenario { param($Name, [bool]$Pass, $Detail) $script:results += [pscustomobject]@{ Scenario = $Name; Pass = $Pass; Detail = $Detail }; Write-Host ("  [{0}] {1} — {2}" -f $(if ($Pass) { 'PASS' } else { 'FAIL' }), $Name, $Detail) -ForegroundColor $(if ($Pass) { 'Green' } else { 'Red' }) }

# --- data generators ----------------------------------------------------------
function New-ChatGptExport {
    param([int]$Count, [string[]]$Titles, [string]$Path, [int]$Seed = 0)
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('[')
    for ($i = 0; $i -lt $Count; $i++) {
        $title = $Titles[($i + $Seed) % $Titles.Count] + " #$i"
        $u = "Discuss $title with some detail about the topic and next steps."
        $a = "Here is guidance on $title. Recorded for the project."
        if ($i -gt 0) { [void]$sb.Append(',') }
        [void]$sb.Append((@{ title = $title; create_time = (1700000000 + $i); mapping = @{
                    a = @{ message = @{ author = @{ role = 'user' }; content = @{ parts = @($u) }; create_time = 1 } }
                    b = @{ message = @{ author = @{ role = 'assistant' }; content = @{ parts = @($a) }; create_time = 2 } }
                } } | ConvertTo-Json -Depth 8 -Compress))
    }
    [void]$sb.Append(']')
    [System.IO.File]::WriteAllText($Path, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
}
function New-DriveExport {
    param([int]$Count, [string]$Path)
    $sb = New-Object System.Text.StringBuilder; [void]$sb.Append('[')
    for ($i = 0; $i -lt $Count; $i++) {
        if ($i -gt 0) { [void]$sb.Append(',') }
        [void]$sb.Append((@{ id = "f$i"; name = "asset_$i.pdf"; mimeType = 'application/pdf'; modifiedTime = '2026-06-01T10:00:00Z'; size = "$((($i % 50) + 1) * 1024)"; webViewLink = "https://drive.google.com/file/d/f$i/view" } | ConvertTo-Json -Compress))
    }
    [void]$sb.Append(']'); [System.IO.File]::WriteAllText($Path, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
}
function Bulk-Assign {
    param([string]$Project, [string[]]$Ids, [string]$Status = 'CLASSIFIED')
    $lines = foreach ($id in $Ids) { @{ id = $id; project = $Project; status = $Status; reason = 'bulk'; decided_by = 'suite'; decided_at = (Get-IsoNow) } | ConvertTo-Json -Compress }
    Add-Content -LiteralPath (Get-AssignmentsPath -Root $Root) -Value $lines -Encoding utf8
}
function Ids-ByProject { param($Proj) @(Get-EffectiveRecords -Root $Root | Where-Object { $_.project -eq $Proj -and $_.type -eq 'conversation' } | ForEach-Object { $_.id }) }
function HotTokens { param($Proj)
    $dir = Get-ProjectDir -Root $Root -Project $Proj; $b = 0L
    foreach ($h in @('00_CURRENT\STATE.md', 'PROJECT_INDEX.md', '00_CURRENT\SOURCE_OF_TRUTH.md', 'SKILLS_AVAILABLE.md')) { $p = Join-Path $dir $h; if (Test-Path -LiteralPath $p) { $b += (Get-Item -LiteralPath $p).Length } }
    return [math]::Round($b / 4.0)
}

Write-Host "FOUNDATION VALIDATION SUITE" -ForegroundColor Cyan
Write-Host ("Root: {0}   scale: conv={1} assets={2} ideas={3}" -f $Root, $Conversations, $Assets, $Ideas) -ForegroundColor DarkGray
$perf = [ordered]@{}

# =============================================================================
# SCENARIO 1 — Large project
# =============================================================================
Write-Host "`n[1] Large project" -ForegroundColor Cyan
$bigConv = Join-Path $gen 'big_conv.json'; $bigAsset = Join-Path $gen 'big_assets.json'
New-ChatGptExport -Count $Conversations -Titles @('deploy pipeline', 'ui polish', 'data model', 'billing', 'auth flow') -Path $bigConv
New-DriveExport -Count $Assets -Path $bigAsset
$perf['ingest_conv_s'] = Time-It { & "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $bigConv }
$perf['ingest_assets_s'] = Time-It { & "$PSScriptRoot\import\Import-GDrive.ps1" -Root $Root -Path $bigAsset }
Bulk-Assign -Project 'BigProject' -Ids (Ids-ByProject 'UNASSIGNED')
# assets are still UNASSIGNED (gdrive) — assign them too
Bulk-Assign -Project 'BigProject' -Ids @(Get-EffectiveRecords -Root $Root | Where-Object { $_.project -eq 'UNASSIGNED' } | ForEach-Object { $_.id })
$perf['compile_s'] = Time-It { & "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project 'BigProject' }
$hot = HotTokens 'BigProject'
$perf['bigproject_hot_tok'] = $hot
$recCount = @(Get-EffectiveRecords -Root $Root | Where-Object { $_.project -eq 'BigProject' }).Count
$budget = 8000
Assert-Scenario 'Large project: hot-tier bounded' ($hot -lt $budget) "hot=$hot tok for $recCount records (budget < $budget); compile $($perf['compile_s'])s"

# =============================================================================
# SCENARIO 2 — Multi-engine identical -> canonical identity
# =============================================================================
Write-Host "`n[2] Multi-engine identity" -ForegroundColor Cyan
$cgPath = Join-Path $gen 'me_chatgpt.json'; $clPath = Join-Path $gen 'me_claude.json'
# Identical logical conversation (same user+assistant text) in both engine formats.
$uTxt = 'Design the canonical schema for the memory system.'; $aTxt = 'The schema is source-independent; adapters normalize to it.'
@{ } | Out-Null
$cg = '[{"title":"Canonical schema","create_time":1700,"mapping":{"a":{"message":{"author":{"role":"user"},"content":{"parts":["' + $uTxt + '"]}}},"b":{"message":{"author":{"role":"assistant"},"content":{"parts":["' + $aTxt + '"]}}}}}]'
$cl = '[{"uuid":"x","name":"Canonical schema","created_at":"2026-01-01T00:00:00Z","chat_messages":[{"sender":"human","text":"' + $uTxt + '"},{"sender":"assistant","text":"' + $aTxt + '"}]}]'
[System.IO.File]::WriteAllText($cgPath, $cg, (New-Object System.Text.UTF8Encoding($false)))
[System.IO.File]::WriteAllText($clPath, $cl, (New-Object System.Text.UTF8Encoding($false)))
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $cgPath | Out-Null
$before = @(Get-EffectiveRecords -Root $Root).Count
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $clPath | Out-Null
$after = @(Get-EffectiveRecords -Root $Root).Count
Assert-Scenario 'Multi-engine: identical content -> one canonical record' ($after -eq $before) "same conversation via ChatGPT+Claude deduped by content hash (records unchanged: $before -> $after)"

# =============================================================================
# SCENARIO 3 — Duplicate stress
# =============================================================================
Write-Host "`n[3] Duplicate stress" -ForegroundColor Cyan
$dupPath = Join-Path $gen 'dupes.json'
# Mix of "skill …" (dominant stem, become core) and non-skill items linked via a
# secondary stem (validation/checker) — these become weak candidates -> operator queue.
New-ChatGptExport -Count $Ideas -Titles @('skill antivirus', 'skill checker', 'skill validator', 'pre-upload validation', 'file checker tool') -Path $dupPath
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $dupPath | Out-Null
# Run audit twice on fresh overlays -> determinism
function Run-Audit {
    $ap = Get-AssignmentsPath -Root $Root; $mp = Get-ModulesPath -Root $Root
    if (Test-Path $ap) { Copy-Item $ap "$ap.bak" -Force }   # preserve BigProject assignments
    # isolate: run audit, capture module members + report
    & "$PSScriptRoot\Invoke-DeepAudit.ps1" -Root $Root -Project 'Skill Cluster' -ModuleName 'Skill Consolidated' -Apply | Out-Null
    $mod = @(Get-Modules -Root $Root -Project 'Skill Cluster')[0]
    return @{ members = @($mod.members | Sort-Object); status = $mod.status }
}
$a1 = Run-Audit
# reset modules + skill-cluster assignments for a clean second run
$mp = Get-ModulesPath -Root $Root; if (Test-Path $mp) { Remove-Item $mp -Force }
# remove Skill Cluster / UNCLASSIFIED assignments (keep BigProject) by rewriting overlay
$keep = Get-Content (Get-AssignmentsPath -Root $Root) -Encoding utf8 | Where-Object { $_ -and ($_ | ConvertFrom-Json).project -notin @('Skill Cluster', 'UNCLASSIFIED') }
[System.IO.File]::WriteAllText((Get-AssignmentsPath -Root $Root), (($keep -join "`n") + "`n"), (New-Object System.Text.UTF8Encoding($false)))
$a2 = Run-Audit
$deterministic = (@($a1.members) -join ',') -eq (@($a2.members) -join ',') -and $a1.status -eq $a2.status
$reportText = Get-Content (Join-Path (Join-Path $Root '_AUDIT') "AUDIT_$(Get-Date -Format 'yyyy-MM-dd').md") -Raw -Encoding utf8
$explainable = ($reportText -match 'Core members') -and ($reportText -match 'Candidates')
$queueFile = @(Get-ChildItem -LiteralPath (Join-Path $Root '_AUDIT') -Filter 'queue_*.ndjson' -ErrorAction SilentlyContinue)
$queued = ($queueFile.Count -gt 0)
Assert-Scenario 'Duplicate stress: deterministic merge' $deterministic "two audit runs -> identical module members ($((@($a1.members)).Count)) & status"
Assert-Scenario 'Duplicate stress: explainable + operator queue' ($explainable -and $queued) "report has core/candidate breakdown; queue present=$queued"

# =============================================================================
# SCENARIO 4 — Recovery / reproducibility
# =============================================================================
Write-Host "`n[4] Recovery / reproducibility" -ForegroundColor Cyan
function Normalize-Md { param($Text) (($Text -split "`r?`n") | Where-Object { $_ -notmatch '(Compiled:|Last saved:|UPDATED=|ingested_at)' }) -join "`n" }
function Snapshot-Generated {
    $map = @{}
    Get-ChildItem -LiteralPath (Join-Path $Root 'Projects') -Recurse -Filter '*.md' -File | ForEach-Object {
        $rel = $_.FullName.Substring($Root.Length)
        $map[$rel] = Get-StringSha256 -Text (Normalize-Md (Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8))
    }
    return $map
}
& "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project ALL | Out-Null
$snapA = Snapshot-Generated
& "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project ALL | Out-Null
$snapB = Snapshot-Generated
$identical = ($snapA.Keys.Count -eq $snapB.Keys.Count)
foreach ($k in $snapA.Keys) { if ($snapA[$k] -ne $snapB[$k]) { $identical = $false; break } }
# re-ingest raw history -> idempotent (0 new by content hash)
$before2 = @(Get-EffectiveRecords -Root $Root).Count
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $bigConv | Out-Null
$after2 = @(Get-EffectiveRecords -Root $Root).Count
Assert-Scenario 'Recovery: recompile is reproducible' $identical "two full compiles -> byte-identical generated files ($($snapA.Keys.Count) files, ignoring timestamps)"
Assert-Scenario 'Recovery: re-ingest raw is idempotent' ($after2 -eq $before2) "re-ingesting raw history added 0 records (content-hash identity): $before2 -> $after2"

# =============================================================================
# SCENARIO 5 — Performance report
# =============================================================================
Write-Host "`n[5] Performance report" -ForegroundColor Cyan
$perf['publish_s'] = Time-It { & "$PSScriptRoot\Publish-Memory.ps1" -Root $Root }
$allRecords = @(Get-EffectiveRecords -Root $Root)
$allModules = @(Get-Modules -Root $Root)
$archived = @($allRecords | Where-Object { $_.status -eq 'ARCHIVED' }).Count
$merged = 0; foreach ($m in $allModules) { $merged += @($m.members).Count }
$footprintBytes = (Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$dupReduction = if ($allRecords.Count -gt 0) { [math]::Round(($archived / [double]$allRecords.Count) * 100, 1) } else { 0 }

$allPass = (@($results | Where-Object { -not $_.Pass }).Count -eq 0)

# --- report -------------------------------------------------------------------
$valDir = Join-Path $Root '_VALIDATION'; New-Item -ItemType Directory -Path $valDir -Force | Out-Null
$rep = New-Object System.Text.StringBuilder
[void]$rep.AppendLine("# FOUNDATION VALIDATION SUITE — $(Get-Date -Format 'yyyy-MM-dd')")
[void]$rep.AppendLine()
[void]$rep.AppendLine("Scale: conversations=$Conversations, assets=$Assets, ideas=$Ideas")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Scenarios")
[void]$rep.AppendLine("| # | Scenario | Result | Detail |")
[void]$rep.AppendLine("|---|----------|--------|--------|")
$n = 0; foreach ($r in $results) { $n++; [void]$rep.AppendLine("| $n | $($r.Scenario) | $(if ($r.Pass) { 'PASS' } else { 'FAIL' }) | $($r.Detail) |") }
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Performance")
[void]$rep.AppendLine("| Metric | Value |")
[void]$rep.AppendLine("|--------|-------|")
[void]$rep.AppendLine("| Ingest conversations ($Conversations) | $($perf['ingest_conv_s']) s |")
[void]$rep.AppendLine("| Ingest assets ($Assets) | $($perf['ingest_assets_s']) s |")
[void]$rep.AppendLine("| Compile (BigProject) | $($perf['compile_s']) s |")
[void]$rep.AppendLine("| Publish (all) | $($perf['publish_s']) s |")
[void]$rep.AppendLine("| BigProject hot-tier | $($perf['bigproject_hot_tok']) tok |")
[void]$rep.AppendLine("| Total records | $($allRecords.Count) |")
[void]$rep.AppendLine("| Archived history | $archived |")
[void]$rep.AppendLine("| Merged duplicates | $merged |")
[void]$rep.AppendLine("| Duplicate reduction | $dupReduction% of records archived |")
[void]$rep.AppendLine("| Memory footprint | $([math]::Round($footprintBytes/1MB,2)) MB on disk |")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Result: $(if ($allPass) { 'ALL SCENARIOS PASSED — FOUNDATION VALIDATED' } else { 'FAILURES PRESENT' })")
$repPath = Join-Path $valDir "SUITE_$(Get-Date -Format 'yyyy-MM-dd').md"
[System.IO.File]::WriteAllText($repPath, $rep.ToString(), (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host ("SUITE RESULT: {0}" -f $(if ($allPass) { 'ALL PASSED' } else { 'FAILURES' })) -ForegroundColor $(if ($allPass) { 'Green' } else { 'Red' })
Write-Host ("  compile={0}s publish={1}s hot={2}tok records={3} archived={4} footprint={5}MB" -f $perf['compile_s'], $perf['publish_s'], $perf['bigproject_hot_tok'], $allRecords.Count, $archived, [math]::Round($footprintBytes/1MB, 2))
Write-Host ("  report: {0}" -f $repPath)
return [pscustomobject]@{ Pass = $allPass; Report = $repPath; Perf = $perf }
