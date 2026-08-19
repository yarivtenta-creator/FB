<#
.SYNOPSIS
    Find the repositories worth excluding from antivirus real-time scanning,
    and measure what the scanner is costing you.

.DESCRIPTION
    Antivirus real-time protection inspects every file open. Git opens
    thousands of small files per command, so a scanned repository can make
    routine git operations several times slower and burn CPU while it happens.

    Norton exposes no command line for exclusions and protects its own
    settings against modification, so this script cannot apply them. It does
    the part that can be automated: locates your repositories, ranks them by
    how expensive they are to scan, benchmarks git, and prints the exact paths
    to paste into Norton's dialog.

    Run it again after adding the exclusions to see the difference.

.PARAMETER SearchPath
    Where to look for repositories. Defaults to your user profile folder.

.PARAMETER MaxDepth
    How deep to search below each path. Default 4.

.PARAMETER SkipBenchmark
    Skip the git timing pass. Faster, but you lose the before/after number.

.PARAMETER OutFile
    Also write the exclusion paths to this file, one per line.

.EXAMPLE
    .\norton-exclusions.ps1

.EXAMPLE
    .\norton-exclusions.ps1 -SearchPath C:\dev, D:\work -OutFile exclusions.txt

.NOTES
    Read-only. Changes nothing on your system. No admin rights needed.
#>

[CmdletBinding()]
param(
    [string[]] $SearchPath,
    [int]      $MaxDepth = 4,
    [switch]   $SkipBenchmark,
    [string]   $OutFile
)

$ErrorActionPreference = 'Stop'

# Directories that dominate scan cost but are rarely worth walking into while
# searching. Excluding the repo root already covers everything beneath it.
$NoiseDirs = @('node_modules', '.venv', 'venv', 'dist', 'build', 'target', '.next', '__pycache__')


function Get-DefaultSearchPaths {
    $candidates = @(
        $env:USERPROFILE
        $(if ($env:USERPROFILE) { Join-Path $env:USERPROFILE 'source\repos' })  # Visual Studio
        'C:\dev'
        'C:\src'
        'C:\projects'
    ) | Where-Object { $_ } | Select-Object -Unique

    $found = @($candidates | Where-Object { Test-Path -LiteralPath $_ })

    # Fall back to the current directory when none of the usual roots exist,
    # e.g. on a non-Windows host or an unusual layout.
    if ($found.Count -eq 0) { return @( (Get-Location).Path ) }
    return $found
}


function Find-GitRepositories {
    param([string[]] $Roots, [int] $Depth)

    $repos = [System.Collections.Generic.List[string]]::new()
    $seen = @{}

    foreach ($root in $Roots) {
        if (-not (Test-Path -LiteralPath $root)) {
            Write-Host ("  skipping (not found): {0}" -f $root) -ForegroundColor DarkGray
            continue
        }

        Write-Host ("  scanning {0} ..." -f $root) -ForegroundColor DarkGray

        $gitDirs = Get-ChildItem -LiteralPath $root -Directory -Filter '.git' `
                                 -Recurse -Depth $Depth -Force -ErrorAction SilentlyContinue

        foreach ($gitDir in $gitDirs) {
            $repoPath = Split-Path -Parent $gitDir.FullName
            $key = $repoPath.ToLowerInvariant()
            if ($seen.ContainsKey($key)) { continue }
            $seen[$key] = $true
            $repos.Add($repoPath)
        }
    }

    return $repos
}


function Measure-Repository {
    param([string] $Path, [switch] $NoBenchmark)

    $fileCount = 0
    $byteCount = 0
    $noiseHit = $false

    try {
        $items = Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue
        foreach ($item in $items) {
            $fileCount++
            $byteCount += $item.Length
            if (-not $noiseHit) {
                $sep = [System.IO.Path]::DirectorySeparatorChar
                foreach ($noise in $NoiseDirs) {
                    if ($item.FullName -like "*$sep$noise$sep*") { $noiseHit = $true; break }
                }
            }
        }
    } catch { }

    $statusMs = $null
    if (-not $NoBenchmark) {
        try {
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            & git -C $Path status --porcelain 2>&1 | Out-Null
            $sw.Stop()
            if ($LASTEXITCODE -eq 0) { $statusMs = [int] $sw.Elapsed.TotalMilliseconds }
        } catch { }
    }

    return [pscustomobject]@{
        Path        = $Path
        Files       = $fileCount
        Bytes       = $byteCount
        MB          = [math]::Round($byteCount / 1MB, 1)
        StatusMs    = $statusMs
        HasNoiseDir = $noiseHit
    }
}


# ------------------------------------------------------------------ run -----

if (-not $SearchPath -or $SearchPath.Count -eq 0) {
    $SearchPath = Get-DefaultSearchPaths
}

Write-Host ''
Write-Host 'Looking for git repositories...' -ForegroundColor Cyan

$repoPaths = Find-GitRepositories -Roots $SearchPath -Depth $MaxDepth

if ($repoPaths.Count -eq 0) {
    Write-Host ''
    Write-Host 'No git repositories found.' -ForegroundColor Yellow
    Write-Host ('Searched: {0}' -f ($SearchPath -join ', ')) -ForegroundColor DarkGray
    Write-Host 'Point it somewhere else with -SearchPath C:\your\code' -ForegroundColor DarkGray
    Write-Host ''
    exit 0
}

Write-Host ("Found {0} repositor{1}. Measuring..." -f $repoPaths.Count, $(if ($repoPaths.Count -eq 1) { 'y' } else { 'ies' })) -ForegroundColor Cyan

$hasGit = [bool] (Get-Command git -ErrorAction SilentlyContinue)
if (-not $hasGit -and -not $SkipBenchmark) {
    Write-Host '  git not on PATH, skipping benchmark.' -ForegroundColor DarkGray
}
$noBench = $SkipBenchmark -or (-not $hasGit)

$results = foreach ($repoPath in $repoPaths) {
    Measure-Repository -Path $repoPath -NoBenchmark:$noBench
}

# Cost is dominated by file count, since the scanner works per file open.
$results = @($results | Sort-Object -Property Files -Descending)

Write-Host ''
# Format-Table -AutoSize emits nothing when it cannot determine console
# width, which happens whenever output is redirected or the host reports a
# width of -1. Out-String with an explicit width makes rendering deterministic.
$table = $results |
    Select-Object @{ N = 'Files';  E = { '{0,7:N0}' -f $_.Files } },
                  @{ N = 'Size';   E = { '{0,8:N1} MB' -f $_.MB } },
                  @{ N = 'git status'; E = {
                        if ($null -eq $_.StatusMs) { '     -' } else { '{0,5:N0} ms' -f $_.StatusMs }
                     } },
                  @{ N = 'Repository'; E = { $_.Path } } |
    Format-Table -AutoSize | Out-String -Width 500
Write-Host $table.TrimEnd()

$totalFiles = ($results | Measure-Object -Property Files -Sum).Sum
$totalMB    = [math]::Round((($results | Measure-Object -Property Bytes -Sum).Sum) / 1MB, 1)

Write-Host ('Total: {0:N0} files, {1:N1} MB across {2} repositories.' -f $totalFiles, $totalMB, $results.Count) -ForegroundColor Cyan

$slow = @($results | Where-Object { $null -ne $_.StatusMs -and $_.StatusMs -ge 500 })
if ($slow.Count -gt 0) {
    Write-Host ''
    $slowNoun = if ($slow.Count -eq 1) { 'repository takes' } else { 'repositories take' }
    Write-Host ('{0} {1} 500ms or more for a bare git status.' -f $slow.Count, $slowNoun) -ForegroundColor Yellow
    Write-Host '  On a warm cache that is slow enough to suspect the scanner.' -ForegroundColor DarkGray
}

$noisy = @($results | Where-Object { $_.HasNoiseDir })
if ($noisy.Count -gt 0) {
    Write-Host ''
    $noisyNoun = if ($noisy.Count -eq 1) { 'repository contains' } else { 'repositories contain' }
    Write-Host ('{0} {1} dependency folders (node_modules and similar).' -f $noisy.Count, $noisyNoun) -ForegroundColor Yellow
    Write-Host '  These are the worst case for a real-time scanner: many thousands of tiny files.' -ForegroundColor DarkGray
}


# ------------------------------------------------------------ exclusions ----

Write-Host ''
Write-Host '--- Paths to exclude ---' -ForegroundColor Green
Write-Host ''
foreach ($result in $results) { Write-Host ('  ' + $result.Path) }

if ($OutFile) {
    $results.Path | Set-Content -LiteralPath $OutFile -Encoding UTF8
    Write-Host ''
    Write-Host ('Written to {0}' -f (Resolve-Path -LiteralPath $OutFile)) -ForegroundColor Green
}

Write-Host ''
Write-Host '--- Adding them in Norton ---' -ForegroundColor Green
Write-Host ''
Write-Host '  Norton 360 -> Settings -> Antivirus -> "Scans and Risks" tab'
Write-Host ''
Write-Host '  There are TWO separate exclusion lists on that tab. Add your repos'
Write-Host '  to BOTH, or the CPU problem will not go away:'
Write-Host ''
Write-Host '    1. "Items to Exclude from Scans"'
Write-Host '       Covers scheduled and manual scans only.'
Write-Host ''
Write-Host '    2. "Items to Exclude from Auto-Protect, Script Control, SONAR'
Write-Host '       and Download Intelligence Detection"'
Write-Host '       This is the real-time one. This is the list that matters for' -ForegroundColor Yellow
Write-Host '       git and build performance.' -ForegroundColor Yellow
Write-Host ''
Write-Host '    For each: click Configure -> Add Folders -> pick the path -> tick'
Write-Host '    "Include Subfolders" -> Apply.'
Write-Host ''
Write-Host '  Exact wording varies a little between Norton versions.' -ForegroundColor DarkGray
Write-Host ''

if (-not $noBench) {
    Write-Host '--- Verifying it worked ---' -ForegroundColor Green
    Write-Host ''
    Write-Host '  Note the `git status` times above, add the exclusions, reboot, then'
    Write-Host '  run this script again. Faster times mean the scanner was the cost.'
    Write-Host '  Unchanged times mean it was not, and the real cause is elsewhere.'
    Write-Host ''
}

Write-Host 'Excluding a folder means Norton stops inspecting files there.' -ForegroundColor DarkGray
Write-Host 'Exclude only directories holding code you trust.' -ForegroundColor DarkGray
Write-Host ''
