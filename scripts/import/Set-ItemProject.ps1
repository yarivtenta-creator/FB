<#
.SYNOPSIS
    Assign an indexed item to a project (or park it in UNCLASSIFIED). Append-only
    decision — never edits the master index. Used by the Deep Audit and by hand.

.DESCRIPTION
    Safety rule: uncertain data is NEVER forced into a project. If -Confident is
    not set, or -Project is omitted, the item is routed to UNCLASSIFIED to await
    later review.

.PARAMETER Id
    The item id (from the index / a card).

.PARAMETER Project
    Target project. Omit (or don't pass -Confident) to route to UNCLASSIFIED.

.PARAMETER Confident
    Assert this assignment is confident. Without it, routing falls back to
    UNCLASSIFIED even if -Project is given.

.PARAMETER Reason
    Why (recorded in the overlay).

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Set-ItemProject.ps1 -Id fe78b9858761 -Project "Vinyl Lab" -Confident -Reason "final website zip"

.EXAMPLE
    .\Set-ItemProject.ps1 -Id 05882d18a34a   # uncertain -> UNCLASSIFIED
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Id,
    [string]$Project,
    [switch]$Confident,
    [string]$Reason = '',
    [string]$Root
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root

$target = $Project
if ([string]::IsNullOrWhiteSpace($Project) -or -not $Confident) {
    if ([string]::IsNullOrWhiteSpace($Reason)) { $Reason = 'not confidently classified' }
    $target = 'UNCLASSIFIED'
}

Set-ItemAssignment -Root $Root -Id $Id -Project $target -Reason $Reason -DecidedBy 'manual'
Write-Host ("Item {0} -> {1}{2}" -f $Id, $target, $(if ($target -eq 'UNCLASSIFIED') { ' (uncertain — parked for review)' } else { '' })) -ForegroundColor Green
