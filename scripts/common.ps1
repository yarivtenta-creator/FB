# common.ps1
# Shared helpers for the Project Memory Automation system.
# Dot-source this file:  . "$PSScriptRoot\common.ps1"
#
# SAFETY CONTRACT (Phase 8):
#   * Never delete an original file.
#   * Never overwrite a file without first copying it to _backups\.
#   * Log every action to _logs\actions.log.
#   * When unsure, callers should mark items NEEDS_REVIEW rather than guess.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Paths / root resolution
# ---------------------------------------------------------------------------

function Get-MemoryRoot {
    <#
      Resolve the memory root folder.
      Precedence: explicit -Root arg  >  $env:GPT_MEMORY_ROOT  >  <repo>\GPT-Memory
      The folder (and its _logs subfolder) is created if missing.
    #>
    param([string]$Root)

    if ([string]::IsNullOrWhiteSpace($Root)) {
        if ($env:GPT_MEMORY_ROOT) {
            $Root = $env:GPT_MEMORY_ROOT
        }
        else {
            # Default: a "GPT-Memory" folder alongside the scripts folder (repo root).
            $repoRoot = Split-Path -Parent $PSScriptRoot
            $Root = Join-Path $repoRoot 'GPT-Memory'
        }
    }

    if (-not (Test-Path -LiteralPath $Root)) {
        New-Item -ItemType Directory -Path $Root -Force | Out-Null
    }
    $Root = (Resolve-Path -LiteralPath $Root).Path

    $logs = Join-Path $Root '_logs'
    if (-not (Test-Path -LiteralPath $logs)) {
        New-Item -ItemType Directory -Path $logs -Force | Out-Null
    }
    return $Root
}

function Get-ProjectDir {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Project
    )
    return (Join-Path (Join-Path $Root 'Projects') $Project)
}

function Get-TimeStamp {
    # Snapshot-friendly timestamp: 2026-07-03_14-30
    return (Get-Date -Format 'yyyy-MM-dd_HH-mm')
}

function Get-IsoNow {
    return (Get-Date -Format 'yyyy-MM-dd HH:mm')
}

# ---------------------------------------------------------------------------
# Logging (Phase 8: log every action)
# ---------------------------------------------------------------------------

function Write-ActionLog {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Message,
        [ValidateSet('INFO', 'WRITE', 'BACKUP', 'CREATE', 'STATUS', 'WARN', 'REVIEW')]
        [string]$Level = 'INFO'
    )
    $log = Join-Path (Join-Path $Root '_logs') 'actions.log'
    $line = '{0}  [{1,-6}]  {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    Add-Content -LiteralPath $log -Value $line -Encoding utf8
}

# ---------------------------------------------------------------------------
# Safe file writing (Phase 8: always backup before overwrite, never delete)
# ---------------------------------------------------------------------------

function Backup-File {
    <#
      Copy an existing file into <project>\_backups\ with a timestamp, so the
      pre-change version is always recoverable. No-op if the file doesn't exist.
      Returns the backup path (or $null if nothing to back up).
    #>
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Root
    )
    if (-not (Test-Path -LiteralPath $Path)) { return $null }

    # Prefer a _backups folder inside the owning project; fall back to root.
    $projectsRoot = Join-Path $Root 'Projects'
    $backupBase = $Root
    $full = (Resolve-Path -LiteralPath $Path).Path
    if ($full.StartsWith((Resolve-Path -LiteralPath $projectsRoot).Path)) {
        # <root>\Projects\<Project>\...  ->  backups live at project level
        $rel = $full.Substring((Resolve-Path -LiteralPath $projectsRoot).Path.Length).TrimStart('\', '/')
        $projectName = ($rel -split '[\\/]')[0]
        $backupBase = Join-Path $projectsRoot $projectName
    }

    $backupDir = Join-Path $backupBase '_backups'
    if (-not (Test-Path -LiteralPath $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }

    $stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
    $name = [System.IO.Path]::GetFileNameWithoutExtension($Path)
    $ext = [System.IO.Path]::GetExtension($Path)
    $backupPath = Join-Path $backupDir ('{0}.{1}{2}.bak' -f $name, $stamp, $ext)

    Copy-Item -LiteralPath $Path -Destination $backupPath -Force
    Write-ActionLog -Root $Root -Level 'BACKUP' -Message "Backed up '$Path' -> '$backupPath'"
    return $backupPath
}

function Write-TextFile {
    <#
      Write UTF-8 (no BOM) text. Backs up any existing file first.
      Works on both Windows PowerShell 5.1 and PowerShell 7+.
    #>
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory)][string]$Root
    )
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $existed = Test-Path -LiteralPath $Path
    if ($existed) { Backup-File -Path $Path -Root $Root | Out-Null }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)

    $verb = if ($existed) { 'WRITE' } else { 'CREATE' }
    Write-ActionLog -Root $Root -Level $verb -Message "Wrote '$Path'"
}

function New-FileIfMissing {
    <#
      Create a file from content only if it does not already exist.
      Never overwrites existing project files (idempotent scaffolding).
    #>
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory)][string]$Root
    )
    if (Test-Path -LiteralPath $Path) { return $false }
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
    Write-ActionLog -Root $Root -Level 'CREATE' -Message "Created '$Path'"
    return $true
}

function Read-TextFile {
    param([Parameter(Mandatory)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return '' }
    return (Get-Content -LiteralPath $Path -Raw -Encoding utf8)
}

# ---------------------------------------------------------------------------
# Status (traffic light)
# ---------------------------------------------------------------------------

# Canonical statuses used across the system. Phase 1 uses the traffic light;
# the extended dashboard colors (Blue/Orange/Gray) arrive in Phase 6.
$script:StatusMap = @{
    'GREEN'   = @{ Emoji = '🟢'; Meaning = 'Saved' }
    'YELLOW'  = @{ Emoji = '🟡'; Meaning = 'Pending changes' }
    'RED'     = @{ Emoji = '🔴'; Meaning = 'Unsaved / blocked' }
    'BLOCKED' = @{ Emoji = '🔴'; Meaning = 'Blocked' }
}

function Resolve-Status {
    param([string]$Status)
    if ([string]::IsNullOrWhiteSpace($Status)) { return 'GREEN' }
    $u = $Status.Trim().ToUpperInvariant()
    switch ($u) {
        'GREEN'   { return 'GREEN' }
        'SAVED'   { return 'GREEN' }
        'YELLOW'  { return 'YELLOW' }
        'PENDING' { return 'YELLOW' }
        'RED'     { return 'RED' }
        'BLOCKED' { return 'BLOCKED' }
        'UNSAVED' { return 'RED' }
        default   { return 'YELLOW' }  # unknown -> treat as pending, never silently "saved"
    }
}

function Get-StatusEmoji {
    param([string]$Status)
    $s = Resolve-Status $Status
    return $script:StatusMap[$s].Emoji
}

function Get-StatusMeaning {
    param([string]$Status)
    $s = Resolve-Status $Status
    return $script:StatusMap[$s].Meaning
}

function Set-ProjectStatus {
    <#
      Persist a project's traffic-light status to a machine-readable file
      (00_CURRENT\STATUS.txt) so the dashboard (Phase 6) can read it later.
      Returns the canonical status string.
    #>
    param(
        [Parameter(Mandatory)][string]$ProjectDir,
        [Parameter(Mandatory)][string]$Root,
        [string]$Status = 'GREEN',
        [string]$Reason = ''
    )
    $s = Resolve-Status $Status
    $statusFile = Join-Path (Join-Path $ProjectDir '00_CURRENT') 'STATUS.txt'
    $body = @(
        "STATUS=$s"
        "EMOJI=$(Get-StatusEmoji $s)"
        "MEANING=$(Get-StatusMeaning $s)"
        "UPDATED=$(Get-IsoNow)"
        "REASON=$Reason"
    ) -join "`n"
    Write-TextFile -Path $statusFile -Content $body -Root $Root
    Write-ActionLog -Root $Root -Level 'STATUS' -Message "Project '$(Split-Path -Leaf $ProjectDir)' status -> $s $(Get-StatusEmoji $s)"
    return $s
}

function Add-RowUnderTableHeader {
    <#
      Insert a Markdown table row immediately after the header separator line
      (the |---|---| row), i.e. as the newest first row of the table.
      If no table is found, the row is appended at the end.
    #>
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string]$Content,
        [Parameter(Mandatory)][string]$Row
    )
    $lines = $Content -split "`r?`n"
    $sepIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i++) {
        # A separator row looks like: | --- | --- | (dashes, pipes, colons, spaces)
        if ($lines[$i] -match '^\s*\|?\s*:?-{2,}.*\|.*-{2,}') {
            $sepIndex = $i
            break
        }
    }
    if ($sepIndex -ge 0) {
        $before = if ($sepIndex -ge 0) { $lines[0..$sepIndex] } else { @() }
        $after = if ($sepIndex + 1 -le $lines.Count - 1) { $lines[($sepIndex + 1)..($lines.Count - 1)] } else { @() }
        $newLines = @($before) + @($Row) + @($after)
        return ($newLines -join "`n")
    }
    return ($Content.TrimEnd() + "`n$Row`n")
}

function Expand-Template {
    <#
      Replace {{TOKEN}} placeholders in template text with values from a hashtable.
    #>
    param(
        [Parameter(Mandatory)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory)][hashtable]$Tokens
    )
    foreach ($k in $Tokens.Keys) {
        $Text = $Text.Replace('{{' + $k + '}}', [string]$Tokens[$k])
    }
    return $Text
}
