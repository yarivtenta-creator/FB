<#
.SYNOPSIS
    The generic Project Compiler. Renders a project's canonical memory
    (PROJECT_INDEX.md + ASSET_INDEX.md) from the canonical index records.

.DESCRIPTION
    Adapter-agnostic by design: it consumes ONLY the canonical effective records
    (master_index merged with the assignment overlay). It has no knowledge of
    Claude, ChatGPT, Drive, or any other source — every adapter normalizes to the
    same record shape, and the Compiler reads that shape and nothing else.

    Real projects compile into GPT-Memory\Projects\<Name>\.
    Reserved buckets compile into their own folders, so uncertain data is never
    forced into a project:
      UNASSIGNED   -> GPT-Memory\_STAGING\        (ingested, not yet audited)
      UNCLASSIFIED -> GPT-Memory\_UNCLASSIFIED\   (audited, couldn't be assigned)

.PARAMETER Project
    Project or reserved bucket to compile. Use 'ALL' to compile every project and
    bucket found in the index.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Compile-ProjectMemory.ps1 -Project "Vinyl Lab"

.EXAMPLE
    .\Compile-ProjectMemory.ps1 -Project ALL
#>
[CmdletBinding()]
param(
    [string]$Project = 'ALL',
    [string]$Root
)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
$records = Get-EffectiveRecords -Root $Root
if (@($records).Count -eq 0 -and @(Get-SessionDeltas -Root $Root).Count -eq 0) {
    Write-Host "Nothing to compile (no records, no session deltas)." -ForegroundColor Yellow; return
}

function Get-BucketDir {
    param([string]$Name)
    switch ($Name.ToUpperInvariant()) {
        'UNASSIGNED'   { return (Join-Path $Root '_STAGING') }
        'UNCLASSIFIED' { return (Join-Path $Root '_UNCLASSIFIED') }
        default        { return (Get-ProjectDir -Root $Root -Project $Name) }
    }
}

function Compile-One {
    param([string]$Name, $Items)

    $isBucket = ($script:ReservedBuckets -contains $Name.ToUpperInvariant())
    $dir = Get-BucketDir -Name $Name
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

    $assets = @($Items | Where-Object { $_.type -ne 'conversation' })
    $convos = @($Items | Where-Object { $_.type -eq 'conversation' })
    # Archived items (duplicate discussions merged into a module) are NOT active memory.
    $activeConvos = @($convos | Where-Object { $_.status -ne 'ARCHIVED' })
    $archivedConvos = @($convos | Where-Object { $_.status -eq 'ARCHIVED' })
    $modules = if ($isBucket) { @() } else { @(Get-Modules -Root $Root -Project $Name) }

    $byType = $Items | Group-Object type | Sort-Object Count -Descending |
        ForEach-Object { "{0}×{1}" -f $_.Count, $_.Name }
    $lastActivity = ($Items | ForEach-Object { $_.date_added } | Sort-Object -Descending | Select-Object -First 1)

    # ---- PROJECT_INDEX.md (rollup rendered from canonical records) ----
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# PROJECT INDEX — $Name")
    [void]$sb.AppendLine()
    if ($isBucket) {
        [void]$sb.AppendLine("> Reserved bucket. Items here are **not** assigned to a real project.")
        [void]$sb.AppendLine("> Uncertain data stays here until reviewed — never forced into a project.")
        [void]$sb.AppendLine()
    }
    [void]$sb.AppendLine("- **Items:** $(@($Items).Count)  ($($byType -join ', '))")
    [void]$sb.AppendLine("- **Assets:** $(@($assets).Count)   **Active conversations:** $(@($activeConvos).Count)   **Archived:** $(@($archivedConvos).Count)   **Modules:** $(@($modules).Count)")
    [void]$sb.AppendLine("- **Last activity:** $lastActivity")
    [void]$sb.AppendLine("- **Compiled:** $(Get-IsoNow) (generated — do not hand-edit)")
    [void]$sb.AppendLine()
    if (@($modules).Count) {
        [void]$sb.AppendLine("## Modules (consolidated — the active canonical record)")
        [void]$sb.AppendLine()
        [void]$sb.AppendLine("| Module | Status | Aliases | Members | Decision |")
        [void]$sb.AppendLine("|--------|--------|---------|---------|----------|")
        foreach ($m in $modules) {
            [void]$sb.AppendLine("| $($m.name) | $($m.status) | $((@($m.aliases)) -join '; ') | $(@($m.members).Count) | $($m.decision) |")
        }
        [void]$sb.AppendLine()
    }
    # Hot-tier stays BOUNDED regardless of project size: PROJECT_INDEX shows a
    # capped, most-recent preview; the full enumerations live in ASSET_INDEX (warm).
    $cap = 25
    if (@($activeConvos).Count) {
        [void]$sb.AppendLine("## Conversations (active) — showing $([math]::Min($cap, @($activeConvos).Count)) of $(@($activeConvos).Count)")
        [void]$sb.AppendLine()
        [void]$sb.AppendLine("| Date | Title | Source | Status | Transcript |")
        [void]$sb.AppendLine("|------|-------|--------|--------|------------|")
        foreach ($c in (@($activeConvos | Sort-Object date_added -Descending) | Select-Object -First $cap)) {
            [void]$sb.AppendLine("| $($c.date_added) | $($c.title) | $($c.source) | $($c.status) | $($c.raw_path) |")
        }
        if (@($activeConvos).Count -gt $cap) { [void]$sb.AppendLine("| … | _$(@($activeConvos).Count - $cap) more_ | | | _see ASSET_INDEX / index_ |") }
        [void]$sb.AppendLine()
    }
    if (@($archivedConvos).Count) {
        [void]$sb.AppendLine("## Archived (duplicate discussions — cold history, not active memory) — $(@($archivedConvos).Count) total")
        [void]$sb.AppendLine()
        [void]$sb.AppendLine("| Date | Title | Source | Transcript |")
        [void]$sb.AppendLine("|------|-------|--------|------------|")
        foreach ($c in (@($archivedConvos | Sort-Object date_added -Descending) | Select-Object -First $cap)) {
            [void]$sb.AppendLine("| $($c.date_added) | $($c.title) | $($c.source) | $($c.raw_path) |")
        }
        if (@($archivedConvos).Count -gt $cap) { [void]$sb.AppendLine("| … | _$(@($archivedConvos).Count - $cap) more archived_ | | |") }
        [void]$sb.AppendLine()
    }
    if (@($assets).Count) {
        [void]$sb.AppendLine("## Assets — showing $([math]::Min($cap, @($assets).Count)) of $(@($assets).Count)")
        [void]$sb.AppendLine()
        [void]$sb.AppendLine("| Date | Title | Type | Status | Path |")
        [void]$sb.AppendLine("|------|-------|------|--------|------|")
        foreach ($a in (@($assets | Sort-Object date_added -Descending) | Select-Object -First $cap)) {
            [void]$sb.AppendLine("| $($a.date_added) | $($a.title) | $($a.type) | $($a.status) | $($a.raw_path) |")
        }
        if (@($assets).Count -gt $cap) { [void]$sb.AppendLine("| … | _$(@($assets).Count - $cap) more_ | | | _see ASSET_INDEX_ |") }
        [void]$sb.AppendLine()
    }
    Write-TextFile -Path (Join-Path $dir 'PROJECT_INDEX.md') -Content $sb.ToString() -Root $Root

    # ---- ASSET_INDEX.md (canonical 8-column asset table) ----
    $ai = New-Object System.Text.StringBuilder
    [void]$ai.AppendLine("# ASSET INDEX — $Name")
    [void]$ai.AppendLine()
    [void]$ai.AppendLine("> Generated by the Project Compiler from the canonical index. Do not hand-edit.")
    [void]$ai.AppendLine()
    [void]$ai.AppendLine("| Asset | Date added | What it contains | Used for | Status | Related session | Local path | Converted MD |")
    [void]$ai.AppendLine("|-------|-----------|------------------|----------|--------|-----------------|------------|--------------|")
    foreach ($a in ($assets | Sort-Object date_added -Descending)) {
        $used = if ($a.purpose) { ($a.purpose -replace '\r?\n', ' ') } else { '' }
        $rel = if ($a.related_sessions) { ($a.related_sessions -join ', ') } else { '' }
        $conv = if ($a.converted_md) { $a.converted_md } else { '' }
        [void]$ai.AppendLine("| $($a.title) | $($a.date_added) | $($a.contains) | $used | $($a.status) | $rel | $($a.raw_path) | $conv |")
    }
    Write-TextFile -Path (Join-Path $dir 'ASSET_INDEX.md') -Content $ai.ToString() -Root $Root

    Write-Host ("  {0,-16} items={1,-3} assets={2,-3} convos={3,-3} -> {4}" -f $Name, @($Items).Count, @($assets).Count, @($convos).Count, $dir)
    Write-ActionLog -Root $Root -Level 'WRITE' -Message "Compiled memory for '$Name' ($(@($Items).Count) items)"
}

function Compile-Sessions {
    <#
      Generate the session-derived project files from SessionDeltas ONLY:
      STATE, TODO, SOURCE_OF_TRUTH, DECISIONS, CHANGELOG, SESSION_LOG,
      SKILLS_USED, per-session snapshots, and STATUS.txt. Save-Session never
      writes these — the Compiler owns them.
    #>
    param([string]$Name, [hashtable]$RecById)

    $deltas = @(Get-SessionDeltas -Root $Root -Project $Name | Sort-Object ts)
    if ($deltas.Count -eq 0) { return }

    $projectDir = Get-ProjectDir -Root $Root -Project $Name
    $currentDir = Join-Path $projectDir '00_CURRENT'
    $sessionsDir = Join-Path $projectDir '01_SESSIONS'
    foreach ($p in @($currentDir, $sessionsDir)) { if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null } }
    $latest = $deltas[$deltas.Count - 1]
    $gen = "> Generated by the Project Compiler from session deltas. Do not hand-edit."

    # ---- per-session snapshots (write-once; deltas are immutable) ----
    $tpl = Read-TextFile -Path (Join-Path $PSScriptRoot 'templates\SESSION_SNAPSHOT.md')
    foreach ($d in $deltas) {
        $dest = Join-Path $sessionsDir $d.snapshot
        if (Test-Path -LiteralPath $dest) { continue }
        $todoItems = if (@($d.todos_added).Count) { (@($d.todos_added) | ForEach-Object { "- [ ] $_" }) -join "`n" } else { '_none_' }
        $dec = if ($d.decision) { "- $($d.decision.text)$(if($d.decision.rationale){" — $($d.decision.rationale)"})" } else { '_none_' }
        $chg = if ($d.change) { "- $($d.change)" } else { '_none_' }
        $ast = if (@($d.assets).Count) { (@($d.assets) | ForEach-Object { $t = if ($RecById.ContainsKey($_)) { $RecById[$_].title } else { $_ }; "- $t" }) -join "`n" } else { '_none_' }
        $tok = @{ PROJECT = $Name; TIMESTAMP = $d.ts; STATUS = $d.status; STATUS_EMOJI = (Get-StatusEmoji $d.status); STATUS_MEANING = (Get-StatusMeaning $d.status); SUMMARY = $d.summary; TODO_ITEMS = $todoItems; DECISIONS = $dec; CHANGES = $chg; ASSETS = $ast; NEXT_ACTION = $d.next_action }
        New-FileIfMissing -Path $dest -Content (Expand-Template -Text $tpl -Tokens $tok) -Root $Root | Out-Null
    }

    # ---- STATE.md (from latest delta) ----
    $stateTpl = Read-TextFile -Path (Join-Path $PSScriptRoot 'templates\STATE.md')
    $stateTok = @{ PROJECT = $Name; STATUS = $latest.status; STATUS_EMOJI = (Get-StatusEmoji $latest.status); STATUS_MEANING = (Get-StatusMeaning $latest.status); LAST_SESSION = "$($latest.ts) ($($latest.snapshot))"; LAST_SAVED = $latest.ts; BLOCKED_REASON = $latest.blocked_reason; NEXT_ACTION = $latest.next_action; SUMMARY = $latest.summary }
    Write-TextFile -Path (Join-Path $currentDir 'STATE.md') -Content (Expand-Template -Text $stateTpl -Tokens $stateTok) -Root $Root
    Set-ProjectStatus -ProjectDir $projectDir -Root $Root -Status $latest.status -Reason $latest.blocked_reason | Out-Null

    # ---- TODO.md (accumulate added minus done) ----
    $doneSet = @{}
    foreach ($d in $deltas) { foreach ($td in @($d.todos_done)) { if ($td) { $doneSet[$td.ToLowerInvariant()] = $td } } }
    $open = New-Object System.Collections.Generic.List[string]
    $done = New-Object System.Collections.Generic.List[string]
    $seen = @{}
    foreach ($d in $deltas) {
        foreach ($ta in @($d.todos_added)) {
            if (-not $ta) { continue }
            $k = $ta.ToLowerInvariant()
            if ($seen.ContainsKey($k)) { continue }
            $seen[$k] = $true
            if ($doneSet.ContainsKey($k)) { $done.Add($ta) } else { $open.Add($ta) }
        }
    }
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# TODO — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    [void]$sb.AppendLine("## Open"); [void]$sb.AppendLine()
    if ($open.Count) { foreach ($t in $open) { [void]$sb.AppendLine("- [ ] $t") } } else { [void]$sb.AppendLine("_none_") }
    [void]$sb.AppendLine(); [void]$sb.AppendLine("## Done (recent)"); [void]$sb.AppendLine()
    if ($done.Count) { foreach ($t in $done) { [void]$sb.AppendLine("- [x] $t") } } else { [void]$sb.AppendLine("_none_") }
    Write-TextFile -Path (Join-Path $currentDir 'TODO.md') -Content $sb.ToString() -Root $Root

    # ---- SOURCE_OF_TRUTH.md (latest entry per item) ----
    $sot = [ordered]@{}
    foreach ($d in $deltas) { foreach ($s in @($d.source_of_truth)) { if ($s -and $s.item) { $sot[$s.item] = $s } } }
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# SOURCE OF TRUTH — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    [void]$sb.AppendLine("| Item | Authoritative file / path | Status | Notes |"); [void]$sb.AppendLine("|------|---------------------------|--------|-------|")
    if ($sot.Count) { foreach ($k in $sot.Keys) { $s = $sot[$k]; [void]$sb.AppendLine("| $($s.item) | $($s.path) | source of truth | $($s.note) |") } }
    else { [void]$sb.AppendLine("| _none yet_ | _tbd_ | | _add via Save-Session -SourceOfTruth_ |") }
    Write-TextFile -Path (Join-Path $currentDir 'SOURCE_OF_TRUTH.md') -Content $sb.ToString() -Root $Root

    # ---- DECISIONS.md (chronological ledger) ----
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# DECISIONS — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    [void]$sb.AppendLine("| Date | Decision | Rationale |"); [void]$sb.AppendLine("|------|----------|-----------|")
    $anyDec = $false
    foreach ($d in $deltas) { if ($d.decision -and $d.decision.text) { [void]$sb.AppendLine("| $($d.date) | $($d.decision.text) | $($d.decision.rationale) |"); $anyDec = $true } }
    if (-not $anyDec) { [void]$sb.AppendLine("| $($latest.date) | _none recorded_ | |") }
    Write-TextFile -Path (Join-Path $currentDir 'DECISIONS.md') -Content $sb.ToString() -Root $Root

    # ---- CHANGELOG.md (grouped by date, newest first) ----
    $byDate = [ordered]@{}
    foreach ($d in ($deltas | Sort-Object ts -Descending)) { if ($d.change) { if (-not $byDate.Contains($d.date)) { $byDate[$d.date] = New-Object System.Collections.Generic.List[string] }; $byDate[$d.date].Add($d.change) } }
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# CHANGELOG — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    if ($byDate.Count) { foreach ($dt in $byDate.Keys) { [void]$sb.AppendLine("## $dt"); foreach ($c in $byDate[$dt]) { [void]$sb.AppendLine("- $c") }; [void]$sb.AppendLine() } }
    else { [void]$sb.AppendLine("_no changes recorded_") }
    Write-TextFile -Path (Join-Path $currentDir 'CHANGELOG.md') -Content $sb.ToString() -Root $Root

    # ---- SESSION_LOG.md (newest first) ----
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# SESSION LOG — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    [void]$sb.AppendLine("| When | Status | Snapshot | Summary |"); [void]$sb.AppendLine("|------|--------|----------|---------|")
    foreach ($d in ($deltas | Sort-Object ts -Descending)) {
        $one = ($d.summary -replace '\r?\n', ' '); if ($one.Length -gt 100) { $one = $one.Substring(0, 97) + '...' }
        [void]$sb.AppendLine("| $($d.ts) | $(Get-StatusEmoji $d.status) $($d.status) | [$($d.snapshot)](01_SESSIONS/$($d.snapshot)) | $one |")
    }
    Write-TextFile -Path (Join-Path $projectDir 'SESSION_LOG.md') -Content $sb.ToString() -Root $Root

    # ---- SKILLS_USED.md (newest first) ----
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# SKILLS USED — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    [void]$sb.AppendLine("| When | Skill / Module | Session | Notes |"); [void]$sb.AppendLine("|------|----------------|---------|-------|")
    foreach ($d in ($deltas | Sort-Object ts -Descending)) { foreach ($sk in @($d.skills_used)) { if ($sk) { [void]$sb.AppendLine("| $($d.ts) | $sk | $($d.snapshot) |  |") } } }
    Write-TextFile -Path (Join-Path $projectDir 'SKILLS_USED.md') -Content $sb.ToString() -Root $Root
}

function Write-DeltalessState {
    <#
      Generate a truthful current-truth for a real project that has NO sessions
      (e.g. consolidated purely by the Deep Audit). Derived from modules + records.
    #>
    param([string]$Name, $Items)
    $projectDir = Get-ProjectDir -Root $Root -Project $Name
    $currentDir = Join-Path $projectDir '00_CURRENT'
    if (-not (Test-Path -LiteralPath $currentDir)) { New-Item -ItemType Directory -Path $currentDir -Force | Out-Null }
    $mods = @(Get-Modules -Root $Root -Project $Name)
    $active = @($Items | Where-Object { $_.status -ne 'ARCHIVED' })
    $archived = @($Items | Where-Object { $_.status -eq 'ARCHIVED' })
    $gen = "> Generated by the Project Compiler. Do not hand-edit."

    $modLine = if ($mods.Count) { (@($mods | ForEach-Object { "$($_.name) [$($_.status)]" })) -join '; ' } else { '(none)' }
    $nextAction = if ($mods.Count -and @($mods | Where-Object { $_.status -ne 'Built' }).Count) {
        "Progress module(s): " + ((@($mods | Where-Object { $_.status -ne 'Built' } | ForEach-Object { $_.name })) -join ', ')
    } else { '(review consolidated state)' }
    $summary = "Consolidated by Deep Audit. Modules: $modLine. Active items: $($active.Count); archived duplicates: $($archived.Count)."

    $stateTpl = Read-TextFile -Path (Join-Path $PSScriptRoot 'templates\STATE.md')
    $tok = @{ PROJECT = $Name; STATUS = 'GREEN'; STATUS_EMOJI = (Get-StatusEmoji 'GREEN'); STATUS_MEANING = (Get-StatusMeaning 'GREEN'); LAST_SESSION = '(none — consolidated by audit)'; LAST_SAVED = (Get-IsoNow); BLOCKED_REASON = '(none)'; NEXT_ACTION = $nextAction; SUMMARY = $summary }
    Write-TextFile -Path (Join-Path $currentDir 'STATE.md') -Content (Expand-Template -Text $stateTpl -Tokens $tok) -Root $Root
    Set-ProjectStatus -ProjectDir $projectDir -Root $Root -Status 'GREEN' -Reason 'consolidated by audit' | Out-Null

    # TODO from module status
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# TODO — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine(); [void]$sb.AppendLine("## Open"); [void]$sb.AppendLine()
    $anyTodo = $false
    foreach ($m in $mods) { if ($m.status -ne 'Built' -and $m.status -ne 'Cancelled') { [void]$sb.AppendLine("- [ ] Build / complete module: $($m.name) [$($m.status)]"); $anyTodo = $true } }
    if (-not $anyTodo) { [void]$sb.AppendLine("_none_") }
    Write-TextFile -Path (Join-Path $currentDir 'TODO.md') -Content $sb.ToString() -Root $Root

    # SOURCE_OF_TRUTH from modules (the consolidated canonical records)
    $sb = New-Object System.Text.StringBuilder
    [void]$sb.AppendLine("# SOURCE OF TRUTH — $Name"); [void]$sb.AppendLine(); [void]$sb.AppendLine($gen); [void]$sb.AppendLine()
    [void]$sb.AppendLine("| Item | Authoritative record | Status | Notes |"); [void]$sb.AppendLine("|------|----------------------|--------|-------|")
    if ($mods.Count) { foreach ($m in $mods) { [void]$sb.AppendLine("| $($m.name) | module ($(@($m.members).Count) sources merged) | $($m.status) | $($m.decision) |") } }
    else { [void]$sb.AppendLine("| _none yet_ | _tbd_ | | |") }
    Write-TextFile -Path (Join-Path $currentDir 'SOURCE_OF_TRUTH.md') -Content $sb.ToString() -Root $Root
}

Write-Host "Compiling project memory (adapter-agnostic)..." -ForegroundColor Green
$recById = @{}; foreach ($r in $records) { $recById[$r.id] = $r }
$recordProjects = @($records | Group-Object project | ForEach-Object { $_.Name })
$deltaProjects = @(Get-SessionDeltas -Root $Root | Group-Object project | ForEach-Object { $_.Name })
$names = @($recordProjects + $deltaProjects | Sort-Object -Unique)
if ($Project -ne 'ALL') {
    $names = @($names | Where-Object { $_ -eq $Project })
    if ($names.Count -eq 0) { Write-Host "Nothing indexed or recorded for '$Project'." -ForegroundColor Yellow; return }
}
foreach ($name in $names) {
    $items = @($records | Where-Object { $_.project -eq $name })
    $isBucket = ($script:ReservedBuckets -contains $name.ToUpperInvariant())
    # Guarantee the mandatory-file scaffold for every real project — including
    # projects created purely by the audit (assignments, no sessions).
    if (-not $isBucket) { & (Join-Path $PSScriptRoot 'New-Project.ps1') -Project $name -Root $Root | Out-Null }
    Compile-One -Name $name -Items $items
    if (-not $isBucket) {
        $deltas = @(Get-SessionDeltas -Root $Root -Project $name)
        if ($deltas.Count) { Compile-Sessions -Name $name -RecById $recById }
        else { Write-DeltalessState -Name $name -Items $items }
    }
}

Write-ActionLog -Root $Root -Level 'INFO' -Message "Compile-ProjectMemory complete (scope=$Project)"
