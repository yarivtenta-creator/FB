<#
.SYNOPSIS
    Step 3 — Markdown converter. Converts readable documents in the cold archive
    (_RAW) to Markdown under each project's 03_CONVERTED_MD\, and records the
    converted_md path in the canonical record via the enrichment overlay.

.DESCRIPTION
    Adapter-agnostic: it reads only canonical effective records, not any source.
    Strategy per document (best available, graceful fallback):
      1. External tool  — Pandoc or Microsoft MarkItDown, if installed.
      2. Native         — csv -> table, text -> fenced, markdown -> normalized copy,
                          html -> basic tag-strip.
      3. Unavailable    — logged, skipped, pipeline continues (converted_md stays null).

    Safety: originals in _RAW are only READ. Output goes to a NEW file in
    03_CONVERTED_MD (backed up if it already exists). Failures never block.

.PARAMETER Project
    Limit to one project/bucket. Default 'ALL'.

.PARAMETER Converter
    Force a strategy: auto (default) | pandoc | markitdown | native | none.

.PARAMETER Force
    Re-convert even if converted_md is already set.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Convert-Documents.ps1 -Project "Vinyl Lab"
#>
[CmdletBinding()]
param(
    [string]$Project = 'ALL',
    [ValidateSet('auto', 'pandoc', 'markitdown', 'native', 'none')]
    [string]$Converter = 'auto',
    [switch]$Force,
    [string]$Root
)

. "$PSScriptRoot\common.ps1"
. "$PSScriptRoot\import\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root

# --- tool detection -----------------------------------------------------------
function Test-Tool { param([string]$Name) return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }
$hasPandoc = Test-Tool 'pandoc'
$hasMarkItDownCli = Test-Tool 'markitdown'
$hasMarkItDownPy = $false
if (-not $hasMarkItDownCli -and (Test-Tool 'python')) {
    try { & python -c "import markitdown" 2>$null; $hasMarkItDownPy = ($LASTEXITCODE -eq 0) } catch { }
}
$hasMarkItDown = $hasMarkItDownCli -or $hasMarkItDownPy
Write-Host ("Converters: pandoc={0} markitdown={1}" -f $hasPandoc, $hasMarkItDown) -ForegroundColor DarkGray

# --- conversion strategies ----------------------------------------------------
function Invoke-Pandoc { param($Src, $Dest)
    try { & pandoc -s $Src -t gfm -o $Dest 2>$null; return ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $Dest)) } catch { return $false }
}
function Invoke-MarkItDown { param($Src, $Dest)
    try {
        if ($script:hasMarkItDownCli) { $out = & markitdown "$Src" 2>$null }
        else { $out = & python -m markitdown "$Src" 2>$null }
        if ($LASTEXITCODE -eq 0 -and $out) {
            [System.IO.File]::WriteAllText($Dest, ($out -join "`n"), (New-Object System.Text.UTF8Encoding($false)))
            return $true
        }
    } catch { }
    return $false
}
function Convert-CsvToMd { param($Src)
    $lines = Get-Content -LiteralPath $Src -Encoding utf8 | Where-Object { $_ -ne '' }
    if (-not $lines) { return '' }
    $rows = $lines | ForEach-Object { , ($_ -split ',') }
    $esc = { param($c) ($c -replace '\|', '\|').Trim() }
    $header = ($rows[0] | ForEach-Object { & $esc $_ }) -join ' | '
    $sep = ($rows[0] | ForEach-Object { '---' }) -join ' | '
    $body = for ($i = 1; $i -lt $rows.Count; $i++) { '| ' + (($rows[$i] | ForEach-Object { & $esc $_ }) -join ' | ') + ' |' }
    return "| $header |`n| $sep |`n" + ($body -join "`n") + "`n"
}
function Convert-HtmlBasic { param($Src)
    $html = Get-Content -LiteralPath $Src -Raw -Encoding utf8
    $html = $html -replace '(?is)<script.*?</script>', '' -replace '(?is)<style.*?</style>', ''
    $html = $html -replace '(?i)<(br|/p|/div|/h[1-6])>', "`n" -replace '<[^>]+>', ''
    $html = $html -replace '&nbsp;', ' ' -replace '&amp;', '&' -replace '&lt;', '<' -replace '&gt;', '>'
    return (($html -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }) -join "`n") + "`n"
}

# Returns @{ Ok; Method; Content(optional); Error }
function Convert-One {
    param($Rec, [string]$Src, [string]$Dest)
    $type = $Rec.type
    $useTool = $Converter -in @('auto', 'pandoc', 'markitdown')
    try {
        switch ($type) {
            'markdown' { return @{ Ok = $true; Method = 'native-copy'; Content = (Get-Content -LiteralPath $Src -Raw -Encoding utf8) } }
            'text'     { return @{ Ok = $true; Method = 'native-text'; Content = "``````text`n$(Get-Content -LiteralPath $Src -Raw -Encoding utf8)`n``````" } }
            'csv'      { return @{ Ok = $true; Method = 'native-csv';  Content = (Convert-CsvToMd -Src $Src) } }
            'html' {
                if ($useTool -and $script:hasMarkItDown -and (Invoke-MarkItDown -Src $Src -Dest $Dest)) { return @{ Ok = $true; Method = 'markitdown' } }
                if ($useTool -and $script:hasPandoc -and (Invoke-Pandoc -Src $Src -Dest $Dest)) { return @{ Ok = $true; Method = 'pandoc' } }
                return @{ Ok = $true; Method = 'native-html-basic'; Content = (Convert-HtmlBasic -Src $Src) }
            }
            { $_ -in @('pdf', 'document') } {
                if ($useTool -and $script:hasMarkItDown -and (Invoke-MarkItDown -Src $Src -Dest $Dest)) { return @{ Ok = $true; Method = 'markitdown' } }
                if ($useTool -and $script:hasPandoc -and $type -eq 'document' -and (Invoke-Pandoc -Src $Src -Dest $Dest)) { return @{ Ok = $true; Method = 'pandoc' } }
                return @{ Ok = $false; Method = 'unavailable'; Error = "no converter for $type (install Pandoc or MarkItDown)" }
            }
            default { return @{ Ok = $false; Method = 'skip'; Error = "type '$type' not convertible" } }
        }
    } catch {
        return @{ Ok = $false; Method = 'error'; Error = $_.Exception.Message }
    }
}

# --- main loop ----------------------------------------------------------------
$records = Get-EffectiveRecords -Root $Root
if ($Project -ne 'ALL') { $records = $records | Where-Object { $_.project -eq $Project } }

$convertibleTypes = @('pdf', 'html', 'markdown', 'document', 'csv', 'text')
$targets = $records | Where-Object { $convertibleTypes -contains $_.type }

$converted = 0; $failed = 0; $skipped = 0
foreach ($rec in $targets) {
    $already = ($rec.PSObject.Properties.Name -contains 'converted_md') -and $rec.converted_md
    if ($already -and -not $Force) { $skipped++; continue }

    $src = Join-Path $Root $rec.raw_path
    if (-not (Test-Path -LiteralPath $src)) {
        Write-ActionLog -Root $Root -Level 'WARN' -Message "Convert skipped, raw missing: $($rec.raw_path)"
        $failed++; continue
    }

    $bucketDir = Resolve-BucketDir -Root $Root -Name $rec.project
    $convDir = Join-Path $bucketDir '03_CONVERTED_MD'
    if (-not (Test-Path -LiteralPath $convDir)) { New-Item -ItemType Directory -Path $convDir -Force | Out-Null }
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($rec.title)
    $dest = Join-Path $convDir ("{0}.{1}.md" -f $baseName, $rec.id)

    $result = Convert-One -Rec $rec -Src $src -Dest $dest
    if ($result.Ok) {
        if ($result.ContainsKey('Content')) {
            $header = "<!-- converted from $($rec.raw_path) via $($result.Method) on $(Get-IsoNow) -->`n`n"
            Write-TextFile -Path $dest -Content ($header + $result.Content) -Root $Root
        }
        $rel = $dest.Substring($Root.Length).TrimStart('\', '/')
        Set-ItemEnrichment -Root $Root -Id $rec.id -Field 'converted_md' -Value $rel -Note $result.Method
        Write-Host ("  [ok:$($result.Method)] $($rec.title) -> $rel")
        $converted++
    }
    else {
        Write-ActionLog -Root $Root -Level 'REVIEW' -Message "Conversion $($result.Method) for '$($rec.title)': $($result.Error)"
        Write-Host ("  [--:$($result.Method)] $($rec.title) — $($result.Error)") -ForegroundColor Yellow
        $failed++
    }
}

Write-Host ""
Write-Host "Conversion complete." -ForegroundColor Green
Write-Host ("  Converted : {0}   Unavailable/failed : {1}   Already done : {2}" -f $converted, $failed, $skipped)
Write-ActionLog -Root $Root -Level 'INFO' -Message "Convert-Documents: $converted converted, $failed failed, $skipped already (scope=$Project)"
