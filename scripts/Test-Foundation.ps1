<#
.SYNOPSIS
    Foundation Validation Suite. Stress-tests robustness (not architecture) with
    increasingly realistic data BEFORE any UI is built. Five scenarios, timed,
    asserted, and reported.

.DESCRIPTION
      1. Large-scale stress — thousands of conversations + assets + many sessions;
         compile time, hot-tier budget enforcement, BOUNDED memory growth.
      2. Multi-engine — same project via ChatGPT / Claude / Drive / GitHub /
         Higgsfield; canonical schema invariant, and canonical memory identical
         regardless of source (provenance excluded).
      3. Recovery — DELETE the canonical project memory, rebuild only from the
         persistent canonical layer, and prove reproducibility.
      4. Determinism — N independent compilations match except metadata exclusions.
      5. Performance report — compile/publish time, duplicate reduction, archive
         growth, hot-tier size, token reduction, memory footprint.

.PARAMETER Conversations
    Conversations per batch for scenario 1 (ingested twice to prove bounded growth).

.PARAMETER Assets
    Assets (Drive metadata) for scenario 1.

.PARAMETER Sessions
    SessionDeltas emitted for the large project (many sessions).

.PARAMETER Ideas
    Similar ideas for the duplicate-related checks.

.PARAMETER Root
    Scratch memory root (default: GPT-Memory-VALIDATION under the repo).
#>
[CmdletBinding()]
param(
    [int]$Conversations = 1500,
    [int]$Assets = 2000,
    [int]$Sessions = 200,
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
$results = @()
function Assert-Scenario { param($Name, [bool]$Pass, $Detail) $script:results += [pscustomobject]@{ Scenario = $Name; Pass = $Pass; Detail = $Detail }; Write-Host ("  [{0}] {1} — {2}" -f $(if ($Pass) { 'PASS' } else { 'FAIL' }), $Name, $Detail) -ForegroundColor $(if ($Pass) { 'Green' } else { 'Red' }) }

# --- generators ---------------------------------------------------------------
function New-ChatGptExport { param([int]$Count, [string[]]$Titles, [string]$Path)
    $sb = New-Object System.Text.StringBuilder; [void]$sb.Append('[')
    for ($i = 0; $i -lt $Count; $i++) {
        $title = $Titles[$i % $Titles.Count] + " #$i"
        if ($i -gt 0) { [void]$sb.Append(',') }
        [void]$sb.Append((@{ title = $title; create_time = (1700000000 + $i); mapping = @{
                    a = @{ message = @{ author = @{ role = 'user' }; content = @{ parts = @("Discuss $title.") }; create_time = 1 } }
                    b = @{ message = @{ author = @{ role = 'assistant' }; content = @{ parts = @("Guidance on $title.") }; create_time = 2 } } } } | ConvertTo-Json -Depth 8 -Compress))
    }
    [void]$sb.Append(']'); [System.IO.File]::WriteAllText($Path, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
}
function New-DriveExport { param([int]$Count, [string]$Path, [string]$Prefix = 'asset')
    $sb = New-Object System.Text.StringBuilder; [void]$sb.Append('[')
    for ($i = 0; $i -lt $Count; $i++) { if ($i -gt 0) { [void]$sb.Append(',') }
        [void]$sb.Append((@{ id = "$Prefix$i"; name = "$($Prefix)_$i.pdf"; mimeType = 'application/pdf'; modifiedTime = '2026-06-01T10:00:00Z'; size = "$((($i % 50) + 1) * 1024)"; webViewLink = "https://drive.google.com/file/d/$Prefix$i/view" } | ConvertTo-Json -Compress)) }
    [void]$sb.Append(']'); [System.IO.File]::WriteAllText($Path, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
}
function Bulk-Assign { param([string]$Project, [string[]]$Ids, [string]$Status = 'CLASSIFIED')
    if (-not $Ids -or $Ids.Count -eq 0) { return }
    $lines = foreach ($id in $Ids) { @{ id = $id; project = $Project; status = $Status; reason = 'bulk'; decided_by = 'suite'; decided_at = (Get-IsoNow) } | ConvertTo-Json -Compress }
    Add-Content -LiteralPath (Get-AssignmentsPath -Root $Root) -Value $lines -Encoding utf8
}
function Unassigned-Ids { @(Get-EffectiveRecords -Root $Root | Where-Object { $_.project -eq 'UNASSIGNED' } | ForEach-Object { $_.id }) }
function HotTokens { param($Proj)
    $dir = Get-ProjectDir -Root $Root -Project $Proj; $b = 0L
    foreach ($h in @('00_CURRENT\STATE.md', 'PROJECT_INDEX.md', '00_CURRENT\SOURCE_OF_TRUTH.md', 'SKILLS_AVAILABLE.md')) { $p = Join-Path $dir $h; if (Test-Path -LiteralPath $p) { $b += (Get-Item -LiteralPath $p).Length } }
    return [math]::Round($b / 4.0)
}
# Normalize compiled memory: drop timestamps AND provenance (source labels, raw
# paths, ids, project name) so meaning can be compared independent of source.
function Normalize-Canonical { param($Text, $ProjectName = '')
    $t = (($Text -split "`r?`n") | Where-Object { $_ -notmatch '(Compiled:|Last saved:|UPDATED=|ingested_at|decided_at)' }) -join "`n"
    if ($ProjectName) { $t = $t -replace [regex]::Escape($ProjectName), '<project>' }
    $t = $t -replace '_RAW/[^ |)]+', '<path>'
    $t = $t -replace 'https?://[^ |)]+', '<url>'
    $t = $t -replace '\b(chatgpt|claude|gdrive|github|higgsfield|files|session)\b', '<source>'
    $t = $t -replace '\bmod_[0-9a-f]+\b', '<mod>'
    return $t
}
function Snapshot-Generated {
    $map = @{}
    Get-ChildItem -LiteralPath (Join-Path $Root 'Projects') -Recurse -Filter '*.md' -File -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($Root.Length)
        $map[$rel] = Get-StringSha256 -Text (Normalize-Canonical (Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8))
    }
    return $map
}
function Snapshots-Equal { param($A, $B)
    if ($A.Keys.Count -ne $B.Keys.Count) { return $false }
    foreach ($k in $A.Keys) { if (-not $B.ContainsKey($k) -or $A[$k] -ne $B[$k]) { return $false } }
    return $true
}

Write-Host "FOUNDATION VALIDATION SUITE" -ForegroundColor Cyan
Write-Host ("Root: {0}   scale: conv={1}x2 assets={2} sessions={3} ideas={4}" -f $Root, $Conversations, $Assets, $Sessions, $Ideas) -ForegroundColor DarkGray
$perf = [ordered]@{}

# =============================================================================
# 1 — Large-scale stress (conversations + assets + many sessions + bounded growth)
# =============================================================================
Write-Host "`n[1] Large-scale stress" -ForegroundColor Cyan
$b1 = Join-Path $gen 'batch1.json'; $b2 = Join-Path $gen 'batch2.json'; $ba = Join-Path $gen 'assets.json'
New-ChatGptExport -Count $Conversations -Titles @('deploy pipeline', 'ui polish', 'data model', 'billing', 'auth') -Path $b1
New-ChatGptExport -Count $Conversations -Titles @('scaling', 'search', 'exports', 'perf', 'infra') -Path $b2
New-DriveExport -Count $Assets -Path $ba
$perf['ingest_conv_s'] = Time-It { & "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $b1 }
$perf['ingest_assets_s'] = Time-It { & "$PSScriptRoot\import\Import-GDrive.ps1" -Root $Root -Path $ba }
Bulk-Assign -Project 'BigProject' -Ids (Unassigned-Ids)
# many sessions (no per-session compile; compile once after)
$perf['sessions_s'] = Time-It {
    for ($i = 0; $i -lt $Sessions; $i++) {
        & "$PSScriptRoot\Save-Session.ps1" -Root $Root -Project 'BigProject' -Summary "Session $i work" -Change "change $i" -Status Green -NextAction "step $i" -NoCompile -NonInteractive | Out-Null
    }
}
$perf['compile_s'] = Time-It { & "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project 'BigProject' }
$hot1 = HotTokens 'BigProject'
$rec1 = @(Get-EffectiveRecords -Root $Root | Where-Object { $_.project -eq 'BigProject' }).Count
# double the data -> prove bounded growth
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $b2 | Out-Null
Bulk-Assign -Project 'BigProject' -Ids (Unassigned-Ids)
$perf['compile2_s'] = Time-It { & "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project 'BigProject' }
$hot2 = HotTokens 'BigProject'
$rec2 = @(Get-EffectiveRecords -Root $Root | Where-Object { $_.project -eq 'BigProject' }).Count
$sessRows = (@(Get-SessionDeltas -Root $Root -Project 'BigProject')).Count
$perf['bigproject_hot_tok'] = $hot2
$budget = 8000
$bounded = (($hot2 - $hot1) -lt 800)
Assert-Scenario '1. Large-scale: hot-tier budget enforced' ($hot2 -lt $budget) "hot=$hot2 tok at $rec2 records (budget < $budget)"
Assert-Scenario '1. Large-scale: memory growth bounded' $bounded "records $rec1 -> $rec2 (~2x); hot $hot1 -> $hot2 tok (delta < 800); $sessRows sessions; compile $($perf['compile2_s'])s"

# =============================================================================
# 2 — Multi-engine (5 sources): schema invariance + source-identical memory
# =============================================================================
Write-Host "`n[2] Multi-engine" -ForegroundColor Cyan
$me = Join-Path $gen 'me'; New-Item -ItemType Directory -Path $me -Force | Out-Null
$u = 'Design the canonical schema.'; $a = 'Source-independent; adapters normalize to it.'
$cgP = Join-Path $me 'cg.json'; $clP = Join-Path $me 'cl.json'; $drP = Join-Path $me 'dr.json'; $ghP = Join-Path $me 'gh.json'; $hgP = Join-Path $me 'hg.json'
[IO.File]::WriteAllText($cgP, '[{"title":"X","create_time":1,"mapping":{"a":{"message":{"author":{"role":"user"},"content":{"parts":["' + $u + '"]}}},"b":{"message":{"author":{"role":"assistant"},"content":{"parts":["' + $a + '"]}}}}}]', (New-Object Text.UTF8Encoding($false)))
[IO.File]::WriteAllText($clP, '[{"uuid":"x","name":"X","created_at":"2026-01-01T00:00:00Z","chat_messages":[{"sender":"human","text":"' + $u + '"},{"sender":"assistant","text":"' + $a + '"}]}]', (New-Object Text.UTF8Encoding($false)))
[IO.File]::WriteAllText($drP, '[{"id":"z","name":"brief.pdf","mimeType":"application/pdf","modifiedTime":"2026-01-01T00:00:00Z","size":"1024","webViewLink":"https://drive.google.com/file/d/z/view"}]', (New-Object Text.UTF8Encoding($false)))
[IO.File]::WriteAllText($ghP, '[{"full_name":"o/r","html_url":"https://github.com/o/r","description":"d","language":"JS","private":false,"updated_at":"2026-01-01T00:00:00Z"}]', (New-Object Text.UTF8Encoding($false)))
[IO.File]::WriteAllText($hgP, '[{"id":"g","media_type":"image","url":"https://cdn.h.ai/g.png","prompt":"p","created_at":"2026-01-01T00:00:00Z"}]', (New-Object Text.UTF8Encoding($false)))
$before = @(Get-EffectiveRecords -Root $Root).Count
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $cgP | Out-Null
& "$PSScriptRoot\import\Import-GDrive.ps1" -Root $Root -Path $drP | Out-Null
& "$PSScriptRoot\import\Import-GitHub.ps1" -Root $Root -Path $ghP | Out-Null
& "$PSScriptRoot\import\Import-Higgsfield.ps1" -Root $Root -Path $hgP | Out-Null
$new4 = @(Get-EffectiveRecords -Root $Root | Where-Object { $_.title -in @('X', 'brief.pdf', 'o/r') -or $_.source -eq 'higgsfield' })
# schema invariance: every source's record shares the identical canonical key set
$refKeys = (@($new4[0].PSObject.Properties.Name) | Sort-Object) -join ','
$schemaOk = $true; $srcs = @()
foreach ($r in $new4) { $srcs += $r.source; if (((@($r.PSObject.Properties.Name) | Sort-Object) -join ',') -ne $refKeys) { $schemaOk = $false } }
Assert-Scenario '2. Multi-engine: canonical schema invariant across sources' $schemaOk "records from $((@($srcs | Select-Object -Unique)) -join '/') share the identical $((@($new4[0].PSObject.Properties.Name)).Count)-field schema"
# cross-source identity: the SAME conversation via ChatGPT and Claude is ONE
# canonical record — identity is content-derived, not source-derived.
$cgRec = @(Get-EffectiveRecords -Root $Root | Where-Object { $_.source -eq 'chatgpt' -and $_.title -eq 'X' })[0]
$n1 = @(Get-EffectiveRecords -Root $Root).Count
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $clP | Out-Null   # same content via Claude
$n2 = @(Get-EffectiveRecords -Root $Root).Count
$stillOne = ($n2 -eq $n1) -and (@(Get-EffectiveRecords -Root $Root | Where-Object { $_.id -eq $cgRec.id -and $_.sha256 -eq $cgRec.sha256 }).Count -eq 1)
Assert-Scenario '2. Multi-engine: canonical memory identical regardless of source' $stillOne "same conversation via ChatGPT + Claude -> one record (id/sha unchanged; records $n1 -> $n2)"

# =============================================================================
# 3 — Recovery: delete canonical memory, rebuild from the persistent layer
# =============================================================================
Write-Host "`n[3] Recovery" -ForegroundColor Cyan
& "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project ALL | Out-Null
$pre = Snapshot-Generated
# DELETE the Canonical Project Memory (compiled outputs); keep only the raw/canonical layer.
Remove-Item -LiteralPath (Join-Path $Root 'Projects') -Recurse -Force
foreach ($b in @('_UNCLASSIFIED', '_STAGING')) { $p = Join-Path $Root $b; if (Test-Path $p) { Remove-Item $p -Recurse -Force } }
$perf['recover_s'] = Time-It { & "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project ALL }
$post = Snapshot-Generated
Assert-Scenario '3. Recovery: rebuilt canonical memory reproduces original' (Snapshots-Equal $pre $post) "deleted Projects/ then recompiled from canonical layer -> $($pre.Keys.Count) files identical (provenance/timestamps excluded)"

# =============================================================================
# 4 — Determinism: N independent compilations
# =============================================================================
Write-Host "`n[4] Determinism" -ForegroundColor Cyan
$snaps = @()
for ($i = 0; $i -lt 3; $i++) { & "$PSScriptRoot\Compile-ProjectMemory.ps1" -Root $Root -Project ALL | Out-Null; $snaps += , (Snapshot-Generated) }
$detOk = (Snapshots-Equal $snaps[0] $snaps[1]) -and (Snapshots-Equal $snaps[1] $snaps[2])
Assert-Scenario '4. Determinism: 3 independent compiles match' $detOk "identical outputs except metadata exclusions (timestamps)"

# =============================================================================
# 5 — Performance report
# =============================================================================
Write-Host "`n[5] Performance report" -ForegroundColor Cyan
# ensure a duplicate cluster exists to report reduction
$dupPath = Join-Path $gen 'dupes.json'
New-ChatGptExport -Count $Ideas -Titles @('skill antivirus', 'skill checker', 'skill validator', 'pre-upload validation', 'file checker') -Path $dupPath
& "$PSScriptRoot\import\Import-Conversations.ps1" -Root $Root -Path $dupPath | Out-Null
& "$PSScriptRoot\Invoke-DeepAudit.ps1" -Root $Root -Project 'Skill Cluster' -ModuleName 'Skill Consolidated' -Apply | Out-Null
$perf['publish_s'] = Time-It { & "$PSScriptRoot\Publish-Memory.ps1" -Root $Root }
$allRecords = @(Get-EffectiveRecords -Root $Root)
$allModules = @(Get-Modules -Root $Root)
$archived = @($allRecords | Where-Object { $_.status -eq 'ARCHIVED' }).Count
$merged = 0; foreach ($m in $allModules) { $merged += @($m.members).Count }
$convCount = @($allRecords | Where-Object { $_.type -eq 'conversation' }).Count
$footprintBytes = (Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$dupReduction = if ($allRecords.Count) { [math]::Round(($archived / [double]$allRecords.Count) * 100, 1) } else { 0 }
$hotTotal = 0L; foreach ($pn in @(Get-ChildItem -LiteralPath (Join-Path $Root 'Projects') -Directory | Select-Object -ExpandProperty Name)) { $hotTotal += (HotTokens $pn) }
$projTokenReduction = if ($convCount) { [math]::Round((1 - ($hotTotal / [double]($hotTotal + $convCount * 1500))) * 100, 1) } else { 0 }

$allPass = (@($results | Where-Object { -not $_.Pass }).Count -eq 0)

$valDir = Join-Path $Root '_VALIDATION'; New-Item -ItemType Directory -Path $valDir -Force | Out-Null
$rep = New-Object System.Text.StringBuilder
[void]$rep.AppendLine("# FOUNDATION VALIDATION SUITE — $(Get-Date -Format 'yyyy-MM-dd')")
[void]$rep.AppendLine()
[void]$rep.AppendLine("Scale: conversations=$Conversations x2, assets=$Assets, sessions=$Sessions, ideas=$Ideas")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Scenarios")
[void]$rep.AppendLine("| Scenario | Result | Detail |")
[void]$rep.AppendLine("|----------|--------|--------|")
foreach ($r in $results) { [void]$rep.AppendLine("| $($r.Scenario) | $(if ($r.Pass) { 'PASS' } else { 'FAIL' }) | $($r.Detail) |") }
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Performance")
[void]$rep.AppendLine("| Metric | Value |")
[void]$rep.AppendLine("|--------|-------|")
[void]$rep.AppendLine("| Compile time (BigProject, ~$rec2 records) | $($perf['compile2_s']) s |")
[void]$rep.AppendLine("| Publish time (all projects) | $($perf['publish_s']) s |")
[void]$rep.AppendLine("| Recovery rebuild time | $($perf['recover_s']) s |")
[void]$rep.AppendLine("| Emit $Sessions sessions | $($perf['sessions_s']) s |")
[void]$rep.AppendLine("| Duplicate reduction | $dupReduction% of records archived ($archived archived, $merged merged) |")
[void]$rep.AppendLine("| Archive growth | $archived archived records |")
[void]$rep.AppendLine("| Hot-tier (BigProject) | $($perf['bigproject_hot_tok']) tok — bounded |")
[void]$rep.AppendLine("| Estimated token reduction | $projTokenReduction% (hot vs ~1,500 tok/conversation x $convCount) |")
[void]$rep.AppendLine("| Total records | $($allRecords.Count) |")
[void]$rep.AppendLine("| Memory footprint | $([math]::Round($footprintBytes/1MB,2)) MB on disk |")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Result: $(if ($allPass) { 'ALL SCENARIOS PASSED — FOUNDATION VALIDATED' } else { 'FAILURES PRESENT' })")
$repPath = Join-Path $valDir "SUITE_$(Get-Date -Format 'yyyy-MM-dd').md"
[System.IO.File]::WriteAllText($repPath, $rep.ToString(), (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host ("SUITE RESULT: {0}" -f $(if ($allPass) { 'ALL PASSED' } else { 'FAILURES' })) -ForegroundColor $(if ($allPass) { 'Green' } else { 'Red' })
Write-Host ("  compile={0}s publish={1}s recover={2}s hot={3}tok records={4} dupRed={5}% footprint={6}MB" -f $perf['compile2_s'], $perf['publish_s'], $perf['recover_s'], $perf['bigproject_hot_tok'], $allRecords.Count, $dupReduction, [math]::Round($footprintBytes/1MB, 2))
Write-Host ("  report: {0}" -f $repPath)
return [pscustomobject]@{ Pass = $allPass; Report = $repPath }
