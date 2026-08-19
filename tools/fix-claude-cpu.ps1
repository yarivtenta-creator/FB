<#
.SYNOPSIS
    Diagnose and clean up runaway Claude Code / Claude desktop processes on Windows.

.DESCRIPTION
    Task Manager groups every Claude process under one row, which hides which of
    them is actually burning CPU. This script samples real CPU usage per process,
    maps the full process tree (Claude -> node MCP servers -> git -> shells), and
    lets you stop the idle or runaway parts without taking down a session that is
    doing real work.

    It never kills git. Killing git mid-write leaves .git\index.lock behind and
    breaks the repository until you delete that file by hand, so the script waits
    for git to exit on its own instead.

.PARAMETER Mode
    Report   - (default) Show what is running. Changes nothing.
    KillIdle - Stop only Claude processes below -IdleThreshold CPU. Frees memory,
               leaves busy sessions alone.
    KillAll  - Stop every Claude process after git finishes.

.PARAMETER IdleThreshold
    CPU percent at or below which a process counts as idle. Default 1.0.

.PARAMETER GitWaitSeconds
    How long to wait for running git processes to finish before giving up.
    Default 90.

.PARAMETER Force
    Skip the confirmation prompt.

.EXAMPLE
    .\fix-claude-cpu.ps1
    Show a report. Safe, read-only.

.EXAMPLE
    .\fix-claude-cpu.ps1 -Mode KillIdle
    Reclaim memory from idle sessions, keep working ones running.

.EXAMPLE
    .\fix-claude-cpu.ps1 -Mode KillAll -Force
    Stop everything, no prompt.

.NOTES
    Requires PowerShell 5.1+ (ships with Windows 10/11). No admin rights needed.
#>

[CmdletBinding()]
param(
    [ValidateSet('Report', 'KillIdle', 'KillAll')]
    [string] $Mode = 'Report',

    [double] $IdleThreshold = 1.0,

    [int] $GitWaitSeconds = 90,

    [switch] $Force
)

$ErrorActionPreference = 'Stop'

# Process names that make up a Claude session. Matched case-insensitively
# against the process name, without the .exe suffix.
$ClaudeRootNames = @('claude')

# Never terminated. Git is interruption-sensitive; the rest are shells that
# tear down on their own once their parent is gone.
$ProtectedNames = @('git', 'git-remote-https', 'git-credential-manager')


function Get-CpuPercentByPid {
    <#
        Get-Process reports cumulative CPU seconds, not a percentage. Sample
        TotalProcessorTime twice and divide the delta by wall time * core count
        to get the same number Task Manager shows.
    #>
    param([int] $SampleMs = 1000)

    $coreCount = [Environment]::ProcessorCount
    $first = @{}

    foreach ($proc in Get-Process -ErrorAction SilentlyContinue) {
        try { $first[$proc.Id] = $proc.TotalProcessorTime.TotalMilliseconds } catch { }
    }

    Start-Sleep -Milliseconds $SampleMs

    $result = @{}
    foreach ($proc in Get-Process -ErrorAction SilentlyContinue) {
        if (-not $first.ContainsKey($proc.Id)) { continue }
        try {
            $delta = $proc.TotalProcessorTime.TotalMilliseconds - $first[$proc.Id]
            $result[$proc.Id] = [math]::Round(($delta / ($SampleMs * $coreCount)) * 100, 1)
        } catch { }
    }

    return $result
}


function Get-ClaudeProcessTree {
    <#
        Returns every process belonging to a Claude session: the claude.exe
        processes themselves plus all their descendants (node MCP servers, git,
        cmd, conhost, powershell).
    #>
    $all = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Select-Object ProcessId, ParentProcessId, Name, CommandLine

    if (-not $all) { return @() }

    $byParent = @{}
    foreach ($proc in $all) {
        $parent = [int] $proc.ParentProcessId
        if (-not $byParent.ContainsKey($parent)) { $byParent[$parent] = @() }
        $byParent[$parent] += $proc
    }

    $roots = $all | Where-Object {
        $ClaudeRootNames -contains ($_.Name -replace '\.exe$', '')
    }

    $collected = @{}
    $queue = [System.Collections.Queue]::new()
    foreach ($root in $roots) { $queue.Enqueue($root) }

    while ($queue.Count -gt 0) {
        $current = $queue.Dequeue()
        $currentPid = [int] $current.ProcessId

        # Guard against a PID appearing twice, and against parent/child cycles
        # that can occur when Windows recycles a PID mid-enumeration.
        if ($collected.ContainsKey($currentPid)) { continue }
        $collected[$currentPid] = $current

        if ($byParent.ContainsKey($currentPid)) {
            foreach ($child in $byParent[$currentPid]) { $queue.Enqueue($child) }
        }
    }

    return $collected.Values
}


function Format-Bytes {
    param([double] $Bytes)
    if ($Bytes -ge 1GB) { return ('{0:N2} GB' -f ($Bytes / 1GB)) }
    return ('{0:N1} MB' -f ($Bytes / 1MB))
}


function Wait-ForGit {
    param([int] $TimeoutSeconds)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $announced = $false

    while ($true) {
        $running = @(Get-Process -ErrorAction SilentlyContinue |
            Where-Object { $ProtectedNames -contains $_.Name })

        if ($running.Count -eq 0) {
            if ($announced) { Write-Host '  git finished.' -ForegroundColor Green }
            return $true
        }

        if (-not $announced) {
            Write-Host ''
            Write-Host ("Waiting for {0} git process(es) to finish (up to {1}s)..." -f $running.Count, $TimeoutSeconds) -ForegroundColor Yellow
            Write-Host '  Killing git mid-write would leave .git\index.lock behind and break the repo.' -ForegroundColor DarkGray
            $announced = $true
        }

        if ((Get-Date) -gt $deadline) {
            Write-Host ''
            Write-Host ("git is still running after {0}s. Not killing it." -f $TimeoutSeconds) -ForegroundColor Yellow
            Write-Host '  Re-run this script once it settles, or investigate that repo.' -ForegroundColor DarkGray
            return $false
        }

        Start-Sleep -Seconds 2
    }
}


# ---------------------------------------------------------------- report ----

Write-Host ''
Write-Host 'Sampling CPU (1s)...' -ForegroundColor DarkGray

$cpuByPid = Get-CpuPercentByPid -SampleMs 1000
$tree = Get-ClaudeProcessTree

if (-not $tree -or @($tree).Count -eq 0) {
    Write-Host ''
    Write-Host 'No Claude processes found. Nothing to do.' -ForegroundColor Green
    Write-Host ''
    exit 0
}

$rows = foreach ($proc in $tree) {
    $procId = [int] $proc.ProcessId
    $live = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if (-not $live) { continue }

    $shortName = $proc.Name -replace '\.exe$', ''

    [pscustomobject]@{
        Id        = $procId
        Name      = $shortName
        Cpu       = if ($cpuByPid.ContainsKey($procId)) { $cpuByPid[$procId] } else { 0.0 }
        MemoryMB  = [math]::Round($live.WorkingSet64 / 1MB, 1)
        Bytes     = $live.WorkingSet64
        Protected = ($ProtectedNames -contains $shortName)
    }
}

$rows = @($rows | Sort-Object -Property Cpu -Descending)

if ($rows.Count -eq 0) {
    Write-Host ''
    Write-Host 'Claude processes exited while scanning. Nothing to do.' -ForegroundColor Green
    Write-Host ''
    exit 0
}

$totalCpu = ($rows | Measure-Object -Property Cpu -Sum).Sum
$totalMem = ($rows | Measure-Object -Property Bytes -Sum).Sum

Write-Host ''
Write-Host ('Claude process tree: {0} processes, {1:N1}% CPU, {2}' -f $rows.Count, $totalCpu, (Format-Bytes $totalMem)) -ForegroundColor Cyan
Write-Host ('Machine has {0} logical cores.' -f [Environment]::ProcessorCount) -ForegroundColor DarkGray
Write-Host ''

# Format-Table -AutoSize emits nothing when it cannot determine console
# width, which happens whenever output is redirected or the host reports a
# width of -1. Out-String with an explicit width makes rendering deterministic.
$table = $rows |
    Select-Object @{ N = 'PID';     E = { $_.Id } },
                  @{ N = 'Process'; E = { $_.Name } },
                  @{ N = 'CPU %';   E = { '{0,5:N1}' -f $_.Cpu } },
                  @{ N = 'Memory';  E = { '{0,8:N1} MB' -f $_.MemoryMB } },
                  @{ N = 'Note';    E = {
                        if ($_.Protected)                  { 'PROTECTED - will not kill' }
                        elseif ($_.Cpu -le $IdleThreshold) { 'idle' }
                        else                               { 'busy' }
                     } } |
    Format-Table -AutoSize | Out-String -Width 500
Write-Host $table.TrimEnd()

$protected = @($rows | Where-Object { $_.Protected })
$idle      = @($rows | Where-Object { -not $_.Protected -and $_.Cpu -le $IdleThreshold })
$busy      = @($rows | Where-Object { -not $_.Protected -and $_.Cpu -gt $IdleThreshold })

if ($protected.Count -gt 0) {
    $gitCpu = ($protected | Measure-Object -Property Cpu -Sum).Sum
    Write-Host ('{0} git process(es) using {1:N1}% CPU. These are never killed.' -f $protected.Count, $gitCpu) -ForegroundColor Yellow
    Write-Host '  Heavy git CPU on Windows is usually antivirus scanning git''s file churn.' -ForegroundColor DarkGray
    Write-Host '  Excluding your repo folders from real-time scanning is the permanent fix.' -ForegroundColor DarkGray
    Write-Host ''
}

if ($Mode -eq 'Report') {
    $idleMem = if ($idle.Count -gt 0) { ($idle | Measure-Object -Property Bytes -Sum).Sum } else { 0 }
    Write-Host 'Report only. Nothing was changed.' -ForegroundColor Green
    Write-Host ''
    Write-Host ('  -Mode KillIdle   stop {0} idle process(es), reclaim {1}' -f $idle.Count, (Format-Bytes $idleMem))
    Write-Host ('  -Mode KillAll    stop all {0} process(es), reclaim {1}' -f ($idle.Count + $busy.Count), (Format-Bytes $totalMem))
    Write-Host ''
    exit 0
}


# ----------------------------------------------------------------- kill -----

$targets = if ($Mode -eq 'KillIdle') { $idle } else { @($idle) + @($busy) }
$targets = @($targets)

if ($targets.Count -eq 0) {
    Write-Host 'Nothing matches that mode. Nothing to do.' -ForegroundColor Green
    Write-Host ''
    exit 0
}

$targetMem = ($targets | Measure-Object -Property Bytes -Sum).Sum

Write-Host ('About to stop {0} process(es), reclaiming about {1}.' -f $targets.Count, (Format-Bytes $targetMem)) -ForegroundColor Yellow

if ($Mode -eq 'KillAll' -and $busy.Count -gt 0) {
    Write-Host ''
    Write-Host ('{0} of these are actively working. Unsaved session work will be lost.' -f $busy.Count) -ForegroundColor Red
    Write-Host '  Typing /exit in each Claude Code window shuts them down cleanly instead.' -ForegroundColor DarkGray
}

if (-not $Force) {
    Write-Host ''
    $answer = Read-Host 'Continue? (y/N)'
    if ($answer -notmatch '^(y|yes)$') {
        Write-Host 'Cancelled. Nothing was changed.' -ForegroundColor Green
        Write-Host ''
        exit 0
    }
}

Wait-ForGit -TimeoutSeconds $GitWaitSeconds | Out-Null

Write-Host ''
$stopped = 0
$failed = 0

foreach ($target in $targets) {
    try {
        Stop-Process -Id $target.Id -Force -ErrorAction Stop
        $stopped++
    } catch {
        # Almost always means the process already exited, usually because we
        # killed its parent a moment ago. Only count a real failure.
        if (Get-Process -Id $target.Id -ErrorAction SilentlyContinue) {
            Write-Host ('  Could not stop PID {0} ({1}): {2}' -f $target.Id, $target.Name, $_.Exception.Message) -ForegroundColor Red
            $failed++
        }
    }
}

Start-Sleep -Seconds 2

$remaining = @(Get-ClaudeProcessTree)

Write-Host ('Stopped {0} process(es).' -f $stopped) -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host ('{0} could not be stopped. Try running as Administrator.' -f $failed) -ForegroundColor Red
}
Write-Host ('{0} Claude process(es) still running.' -f $remaining.Count) -ForegroundColor Cyan
Write-Host ''

if ($remaining.Count -gt 0 -and $Mode -eq 'KillAll') {
    Write-Host 'Still seeing processes after KillAll? Something is respawning them:' -ForegroundColor Yellow
    Write-Host '  - Claude desktop app relaunching from the system tray. Quit it there.' -ForegroundColor DarkGray
    Write-Host '  - Open terminal windows restarting their session. Close the windows.' -ForegroundColor DarkGray
    Write-Host ''
}
