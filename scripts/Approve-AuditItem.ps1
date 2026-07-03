<#
.SYNOPSIS
    Operator approval for a queued Deep Audit candidate. Merges the item into its
    suggested module (archives the raw discussion) via the append-only overlay.

.PARAMETER Id
    The queued item id (from _AUDIT/queue_*.ndjson or the audit report).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Approve-AuditItem.ps1 -Id 3f1c...
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Id,
    [string]$Root
)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root
$auditDir = Get-AuditDir -Root $Root

# Find the queued proposal for this id (latest wins).
$proposal = $null
Get-ChildItem -LiteralPath $auditDir -Filter 'queue_*.ndjson' -File -ErrorAction SilentlyContinue |
    Sort-Object Name | ForEach-Object {
        Get-Content -LiteralPath $_.FullName -Encoding utf8 | ForEach-Object {
            if ([string]::IsNullOrWhiteSpace($_)) { return }
            try { $q = $_ | ConvertFrom-Json; if ($q.id -eq $Id) { $proposal = $q } } catch { }
        }
    }
if (-not $proposal) { throw "No queued proposal found for id '$Id'." }

# Archive the raw item into the project, and add it to the module.
Set-ItemAssignment -Root $Root -Id $Id -Project $proposal.suggested_project -Status 'ARCHIVED' -Reason "operator-approved merge into $($proposal.suggested_module_name)" -DecidedBy 'operator'

$module = @(Get-Modules -Root $Root | Where-Object { $_.id -eq $proposal.suggested_module }) | Select-Object -First 1
if ($module) {
    $members = @($module.members) + $Id | Select-Object -Unique
    $aliases = @($module.aliases) + $proposal.title | Select-Object -Unique
    Add-Module -Root $Root -Module @{
        id = $module.id; name = $module.name; project = $module.project; status = $module.status
        aliases = $aliases; members = $members; relevant_files = @($module.relevant_files)
        decision = $module.decision
    } | Out-Null
}
else { Write-Warning "Module $($proposal.suggested_module) not found; item archived but not linked." }

Write-Host ("Approved: '$($proposal.title)' merged into $($proposal.suggested_module_name) and archived." ) -ForegroundColor Green
Write-Host "Run Compile-ProjectMemory to regenerate outputs." -ForegroundColor DarkGray
