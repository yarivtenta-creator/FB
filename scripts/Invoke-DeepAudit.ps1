<#
.SYNOPSIS
    One-time Deep Audit (scoped to one project). Classifies UNASSIGNED items,
    detects duplicate-idea clusters, consolidates the primary cluster into a
    single canonical module, detects item status, and writes every decision
    through the append-only assignment overlay. Uncertain data is never forced
    into a project — it goes to UNCLASSIFIED or the operator approval queue.

.DESCRIPTION
    Deterministic and transparent. Steps:
      1. Classify UNASSIGNED items.
      2. Cluster duplicates by shared title stems (connected components).
      3. Pick the primary cluster (matches -Project, else largest).
      4. Core members (share the dominant stem) -> merge into ONE module,
         archive the raw discussions (status=ARCHIVED).
      5. Weakly-linked members -> queued for Operator approval (not applied).
      6. Singletons -> route to an existing project by name match, else UNCLASSIFIED.
      7. Detect status (completed / remaining / cancelled / obsolete).
    Nothing is applied unless -Apply is given (default = dry-run report).

.PARAMETER Project
    Consolidation target project for the primary cluster (e.g. "Skill Safety").

.PARAMETER ModuleName
    Name for the consolidated module (default derived from the dominant term).

.PARAMETER Apply
    Commit confident decisions to the overlay + modules store. Without it, the
    audit only writes a report and the approval queue (safe dry-run).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Invoke-DeepAudit.ps1 -Project "Skill Safety" -ModuleName "Skill Safety Check" -Apply
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Project,
    [string]$ModuleName,
    [switch]$Apply,
    [string]$Root
)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root

$stop = @('the', 'and', 'for', 'with', 'idea', 'ideas', 'notes', 'note', 'plan', 'plans', 'about', 'discussion', 'discussions', 'draft', 'this', 'that', 'from', 'into', 'new', 'old')
function Get-Stems {
    param([string]$Text)
    if (-not $Text) { return @() }
    $tokens = ([regex]::Matches($Text.ToLowerInvariant(), '[a-z0-9]+') | ForEach-Object { $_.Value }) |
        Where-Object { $_.Length -ge 3 -and $stop -notcontains $_ }
    return @($tokens | ForEach-Object { if ($_.Length -ge 6) { $_.Substring(0, 5) } else { $_ } } | Select-Object -Unique)
}
function Get-ItemStatus {
    param([string]$Text)
    $t = ($Text).ToLowerInvariant()
    if ($t -match '\b(cancel|cancell?ed|scrapped|abandoned|dropped|wontfix)\b') { return 'cancelled' }
    if ($t -match '\b(obsolete|deprecated|outdated|superseded|replaced|legacy)\b') { return 'obsolete' }
    # Negation guards: "not built yet" is remaining, not completed.
    if ($t -match '\bnot\s+(yet\b|built|done|finished|complete|deployed|shipped)') { return 'remaining' }
    if ($t -match '\b(plan|planned|todo|need|needs|should|wip|draft|idea|proposal|backlog)\b') { return 'remaining' }
    if ($t -match '\b(built|done|shipped|finished|complete|completed|deployed|final|working|live)\b') { return 'completed' }
    return 'unknown'
}

# --- gather UNASSIGNED items --------------------------------------------------
$records = Get-EffectiveRecords -Root $Root
$unassigned = @($records | Where-Object { $_.project -eq 'UNASSIGNED' })
if ($unassigned.Count -eq 0) { Write-Host "No UNASSIGNED items to audit." -ForegroundColor Yellow; return }

$items = @()
foreach ($r in $unassigned) {
    $purpose = if ($r.PSObject.Properties.Name -contains 'purpose') { [string]$r.purpose } else { '' }
    $contains = if ($r.PSObject.Properties.Name -contains 'contains') { [string]$r.contains } else { '' }
    $items += [pscustomobject]@{
        id = $r.id; title = $r.title; type = $r.type; raw_path = $r.raw_path
        stems = (Get-Stems $r.title)
        status = (Get-ItemStatus "$($r.title) $purpose $contains")
    }
}

# --- cluster by shared title stems (union-find) -------------------------------
$parent = @{}; foreach ($it in $items) { $parent[$it.id] = $it.id }
function Find-Root { param($x) while ($parent[$x] -ne $x) { $parent[$x] = $parent[$parent[$x]]; $x = $parent[$x] }; return $x }
function Union-Set { param($a, $b) $ra = Find-Root $a; $rb = Find-Root $b; if ($ra -ne $rb) { $parent[$ra] = $rb } }

# signal stems = stems appearing in >=2 items, length >=4
$stemDocs = @{}
foreach ($it in $items) { foreach ($s in $it.stems) { if (-not $stemDocs.ContainsKey($s)) { $stemDocs[$s] = New-Object System.Collections.Generic.List[string] }; $stemDocs[$s].Add($it.id) } }
$signal = @($stemDocs.Keys | Where-Object { $_.Length -ge 4 -and $stemDocs[$_].Count -ge 2 })
foreach ($s in $signal) { $ids = $stemDocs[$s]; for ($i = 1; $i -lt $ids.Count; $i++) { Union-Set $ids[0] $ids[$i] } }

# Group ids by root, then materialise each cluster as an explicit array in a
# List so PowerShell never unrolls the inner arrays through a pipeline.
$byRoot = @{}
foreach ($it in $items) {
    $r = [string](Find-Root $it.id)
    if (-not $byRoot.ContainsKey($r)) { $byRoot[$r] = @() }
    $byRoot[$r] = @($byRoot[$r]) + $it
}
$rootKeys = @($byRoot.Keys)
$dupClusters = @()
$sizes = @()
foreach ($k in $rootKeys) {
    $c = @($byRoot[$k])
    $sizes += $c.Count
    if ($c.Count -ge 2) { $dupClusters += , $c }   # unary comma keeps the cluster as one element
}
if ($env:AUDIT_DEBUG) { Write-Host "DBG signal=$($signal -join ',')  clusters=$($sizes -join '/')  dup=$($dupClusters.Count)" -ForegroundColor Magenta }

# --- pick primary cluster (matches -Project, else largest) --------------------
$projStems = Get-Stems $Project
$primary = $null; $largest = $null
foreach ($c in $dupClusters) {
    $carr = @($c)
    $cStems = @($carr | ForEach-Object { $_.stems }) | Select-Object -Unique
    if (-not $largest -or $carr.Count -gt @($largest).Count) { $largest = $carr }
    if (@($cStems | Where-Object { $projStems -contains $_ }).Count -gt 0) {
        if (-not $primary -or $carr.Count -gt @($primary).Count) { $primary = $carr }
    }
}
if (-not $primary) { $primary = $largest }
$primary = @($primary)
if ($env:AUDIT_DEBUG -and $primary) { Write-Host "DBG primary size=$(@($primary).Count): $((@($primary | ForEach-Object { $_.title })) -join ' | ')" -ForegroundColor Magenta }

# --- split primary into core (dominant stem) vs candidates --------------------
$core = @(); $candidates = @(); $dominant = ''
if ($primary) {
    $freq = @{}
    foreach ($it in $primary) { foreach ($s in $it.stems) { if ($signal -contains $s) { $freq[$s] = ($freq[$s] + 1) } } }
    $dominant = ($freq.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
    foreach ($it in $primary) { if ($it.stems -contains $dominant) { $core += $it } else { $candidates += $it } }
}

# --- classify the rest (singletons / non-primary) -----------------------------
$existingProjects = @(Get-ChildItem -LiteralPath (Join-Path $Root 'Projects') -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
$primaryIds = @($primary | ForEach-Object { $_.id })
$routes = @()      # @{item; project}
$unclassified = @()
foreach ($it in $items) {
    if ($primaryIds -contains $it.id) { continue }
    $matched = $null
    foreach ($p in $existingProjects) {
        $pStems = @(Get-Stems $p | Where-Object { $_.Length -ge 4 })
        if (@($it.stems | Where-Object { $pStems -contains $_ }).Count -gt 0) { $matched = $p; break }
    }
    if ($matched) { $routes += [pscustomobject]@{ item = $it; project = $matched } }
    else { $unclassified += $it }
}

# --- module synthesis ---------------------------------------------------------
if (-not $ModuleName) {
    $ModuleName = if ($dominant) { (Get-Culture).TextInfo.ToTitleCase($dominant) + ' (module)' } else { "$Project module" }
}
$moduleId = 'mod_' + (New-IngestId (Get-StringSha256 -Text "$Project|$ModuleName"))
$memberStatuses = @($core | ForEach-Object { $_.status })
$moduleStatus = if ($memberStatuses -contains 'completed') { if (@($memberStatuses | Where-Object { $_ -ne 'completed' }).Count -eq 0) { 'Built' } else { 'Partial' } }
    elseif (@($memberStatuses | Where-Object { $_ -eq 'cancelled' }).Count -gt @($memberStatuses).Count / 2) { 'Cancelled' }
    else { 'Not Built' }

# --- write report + queue -----------------------------------------------------
$auditDir = Get-AuditDir -Root $Root
$dateStr = Get-Date -Format 'yyyy-MM-dd'
$queuePath = Join-Path $auditDir "queue_$dateStr.ndjson"

$rep = New-Object System.Text.StringBuilder
[void]$rep.AppendLine("# DEEP AUDIT — $Project  ($dateStr)")
[void]$rep.AppendLine()
[void]$rep.AppendLine("Mode: $(if ($Apply) { 'APPLY (decisions committed to overlay)' } else { 'DRY-RUN (report only)' })")
[void]$rep.AppendLine("UNASSIGNED items scanned: $($items.Count)")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Consolidated module")
[void]$rep.AppendLine("- **Module:** $ModuleName  (id: $moduleId)")
[void]$rep.AppendLine("- **Project:** $Project")
[void]$rep.AppendLine("- **Status:** $moduleStatus")
[void]$rep.AppendLine("- **Aliases:** $((@($core | ForEach-Object { $_.title })) -join '; ')")
[void]$rep.AppendLine("- **Members (merged, archived):** $($core.Count)")
[void]$rep.AppendLine("- **Decision:** keep consolidated state; archive duplicate discussions")
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Core members -> merged & archived")
foreach ($it in $core) { [void]$rep.AppendLine("- [$($it.status)] $($it.title)  ($($it.id))") }
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Candidates -> QUEUED for Operator approval (not applied)")
if ($candidates.Count) { foreach ($it in $candidates) { [void]$rep.AppendLine("- [$($it.status)] $($it.title)  ($($it.id))  — weak link, needs approval") } } else { [void]$rep.AppendLine("_none_") }
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Routed to existing projects")
if ($routes.Count) { foreach ($r in $routes) { [void]$rep.AppendLine("- $($r.item.title) -> $($r.project)  ($($r.item.id))") } } else { [void]$rep.AppendLine("_none_") }
[void]$rep.AppendLine()
[void]$rep.AppendLine("## Uncertain -> UNCLASSIFIED (never forced)")
if ($unclassified.Count) { foreach ($it in $unclassified) { [void]$rep.AppendLine("- $($it.title)  ($($it.id))") } } else { [void]$rep.AppendLine("_none_") }
$reportPath = Join-Path $auditDir "AUDIT_$dateStr.md"
Write-TextFile -Path $reportPath -Content $rep.ToString() -Root $Root

# queue file (append-only) for candidates
if ($candidates.Count) {
    foreach ($it in $candidates) {
        $q = [ordered]@{ id = $it.id; title = $it.title; suggested_module = $moduleId; suggested_module_name = $ModuleName; suggested_project = $Project; status = $it.status; reason = 'weak cluster link — operator approval required' }
        Add-Content -LiteralPath $queuePath -Value (([pscustomobject]$q) | ConvertTo-Json -Compress) -Encoding utf8
    }
}

# --- apply confident decisions ------------------------------------------------
if ($Apply) {
    foreach ($it in $core) { Set-ItemAssignment -Root $Root -Id $it.id -Project $Project -Status 'ARCHIVED' -Reason "merged into module $ModuleName" -DecidedBy 'audit' }
    foreach ($r in $routes) { Set-ItemAssignment -Root $Root -Id $r.item.id -Project $r.project -Status 'CLASSIFIED' -Reason 'routed by name match' -DecidedBy 'audit' }
    foreach ($it in $unclassified) { Set-ItemAssignment -Root $Root -Id $it.id -Project 'UNCLASSIFIED' -Reason 'no confident project match' -DecidedBy 'audit' }
    Add-Module -Root $Root -Module @{
        id = $moduleId; name = $ModuleName; project = $Project; status = $moduleStatus
        aliases = @($core | ForEach-Object { $_.title }); members = @($core | ForEach-Object { $_.id })
        relevant_files = @($core | ForEach-Object { $_.raw_path })
    } | Out-Null
}

# --- summary ------------------------------------------------------------------
Write-Host ""
Write-Host "Deep Audit $(if ($Apply) { 'APPLIED' } else { 'DRY-RUN' }) — $Project" -ForegroundColor Green
Write-Host ("  Module     : {0} [{1}]  core members: {2}" -f $ModuleName, $moduleStatus, $core.Count)
Write-Host ("  Queued     : {0} (operator approval)" -f $candidates.Count)
Write-Host ("  Routed     : {0}   Unclassified: {1}" -f $routes.Count, $unclassified.Count)
Write-Host ("  Report     : {0}" -f $reportPath)
if ($candidates.Count) { Write-Host ("  Queue      : {0}" -f $queuePath) }
if (-not $Apply) { Write-Host "  (dry-run — re-run with -Apply to commit)" -ForegroundColor DarkGray }
Write-ActionLog -Root $Root -Level 'INFO' -Message "Deep Audit ($(if($Apply){'apply'}else{'dry-run'})) ${Project}: module=$ModuleName core=$($core.Count) queued=$($candidates.Count) routed=$($routes.Count) unclassified=$($unclassified.Count)"
