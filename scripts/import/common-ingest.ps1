# common-ingest.ps1
# Shared ingestion helpers: raw preservation, hashing, append-only indexing,
# type detection, and Markdown card rendering. Deterministic — no LLM.
#
# Dot-source AFTER common.ps1:
#   . "$PSScriptRoot\..\common.ps1"
#   . "$PSScriptRoot\common-ingest.ps1"

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Index / raw paths
# ---------------------------------------------------------------------------

function Get-IndexPath {
    param([Parameter(Mandatory)][string]$Root)
    $indexDir = Join-Path $Root '_INDEX'
    if (-not (Test-Path -LiteralPath $indexDir)) { New-Item -ItemType Directory -Path $indexDir -Force | Out-Null }
    return (Join-Path $indexDir 'master_index.ndjson')
}

function Get-RawDir {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Source,
        [string]$DateStr
    )
    if ([string]::IsNullOrWhiteSpace($DateStr)) { $DateStr = (Get-Date -Format 'yyyy-MM-dd') }
    $dir = Join-Path (Join-Path (Join-Path $Root '_RAW') $Source) $DateStr
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return $dir
}

# ---------------------------------------------------------------------------
# Hashing / ids
# ---------------------------------------------------------------------------

function Get-Sha256 {
    param([Parameter(Mandatory)][string]$Path)
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-StringSha256 {
    # Hash arbitrary text (e.g. a conversation transcript) with no temp file.
    param([Parameter(Mandatory)][AllowEmptyString()][string]$Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        return ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    } finally { $sha.Dispose() }
}

function New-IngestId {
    # Deterministic short id derived from the content hash (no randomness — keeps
    # results reproducible and resumable). First 12 hex chars of the sha.
    param([Parameter(Mandatory)][string]$Sha256)
    return $Sha256.Substring(0, 12)
}

# ---------------------------------------------------------------------------
# Type detection
# ---------------------------------------------------------------------------

function Get-AssetType {
    param([Parameter(Mandatory)][string]$Extension)
    $e = $Extension.TrimStart('.').ToLowerInvariant()
    switch -Regex ($e) {
        '^(zip|7z|rar|tar|gz|tgz)$'            { return 'archive' }
        '^pdf$'                                { return 'pdf' }
        '^(png|jpg|jpeg|gif|webp|bmp|svg|tiff|ico)$' { return 'image' }
        '^(mp4|mov|avi|mkv|webm|m4v|flv)$'     { return 'video' }
        '^(mp3|wav|flac|aac|ogg|m4a)$'         { return 'audio' }
        '^(html|htm)$'                         { return 'html' }
        '^(md|markdown)$'                      { return 'markdown' }
        '^(doc|docx|odt|rtf|pages)$'           { return 'document' }
        '^(xls|xlsx|ods)$'                     { return 'spreadsheet' }
        '^csv$'                                { return 'csv' }
        '^txt$'                                { return 'text' }
        '^(json|xml|yaml|yml)$'                { return 'data' }
        default                                { return 'other' }
    }
}

# Which types can we (attempt to) convert to Markdown later (Phase 5 / converter)?
function Test-Convertible {
    param([Parameter(Mandatory)][string]$Type)
    return @('pdf', 'html', 'markdown', 'document', 'csv', 'text') -contains $Type
}

# ---------------------------------------------------------------------------
# Raw preservation (copy, never move; never overwrite different content)
# ---------------------------------------------------------------------------

function Copy-ToRaw {
    <#
      Copy a source file into _RAW/<source>/<date>/ without ever overwriting a
      different file. Returns the destination path (repo-relative to $Root).
    #>
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$SourceFile,
        [Parameter(Mandatory)][string]$Source,
        [Parameter(Mandatory)][string]$Sha256,
        [string]$DateStr
    )
    $rawDir = Get-RawDir -Root $Root -Source $Source -DateStr $DateStr
    $name = [System.IO.Path]::GetFileName($SourceFile)
    $dest = Join-Path $rawDir $name

    if (Test-Path -LiteralPath $dest) {
        # Same content already there? Leave it. Different? Disambiguate with hash.
        $existingHash = Get-Sha256 -Path $dest
        if ($existingHash -ne $Sha256) {
            $base = [System.IO.Path]::GetFileNameWithoutExtension($name)
            $ext = [System.IO.Path]::GetExtension($name)
            $dest = Join-Path $rawDir ('{0}.{1}{2}' -f $base, (New-IngestId $Sha256), $ext)
        }
    }
    if (-not (Test-Path -LiteralPath $dest)) {
        Copy-Item -LiteralPath $SourceFile -Destination $dest -Force
        Write-ActionLog -Root $Root -Level 'CREATE' -Message "Raw copy: '$SourceFile' -> '$dest'"
    }
    return $dest
}

# ---------------------------------------------------------------------------
# Index (append-only NDJSON) with SHA-based dedup
# ---------------------------------------------------------------------------

function Get-IndexHashes {
    <#
      Return a hashtable of sha256 -> id already present in the index, so ingest
      is idempotent and exact duplicates are detected deterministically.
    #>
    param([Parameter(Mandatory)][string]$Root)
    $seen = @{}
    $indexPath = Get-IndexPath -Root $Root
    if (-not (Test-Path -LiteralPath $indexPath)) { return $seen }
    Get-Content -LiteralPath $indexPath -Encoding utf8 | ForEach-Object {
        if ([string]::IsNullOrWhiteSpace($_)) { return }
        try {
            $obj = $_ | ConvertFrom-Json
            if ($obj.sha256) { $seen[$obj.sha256] = $obj.id }
        } catch { }
    }
    return $seen
}

function Get-AssignmentsPath {
    # Append-only overlay of classification decisions (audit / human), kept
    # separate from the immutable master_index so records are never overwritten.
    param([Parameter(Mandatory)][string]$Root)
    $dir = Join-Path $Root '_INDEX'
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir 'assignments.ndjson')
}

# Reserved bucket names — never real projects. Uncertain data lives here, not in
# a project. UNASSIGNED = freshly ingested, not yet audited.
# UNCLASSIFIED = audited but could not be confidently assigned (awaits review).
$script:ReservedBuckets = @('UNASSIGNED', 'UNCLASSIFIED')

function Set-ItemAssignment {
    <#
      Append a classification decision for one indexed item. Last write wins at
      compile time. This is how the Audit routes items to a project — or parks
      them in UNCLASSIFIED. Never edits the master index.
    #>
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Project,
        [string]$Status,
        [string]$Reason = '',
        [string]$DecidedBy = 'audit'
    )
    if ([string]::IsNullOrWhiteSpace($Status)) {
        $Status = if ($script:ReservedBuckets -contains $Project.ToUpperInvariant()) { 'NEEDS_REVIEW' } else { 'CLASSIFIED' }
    }
    $rec = [ordered]@{
        id = $Id; project = $Project; status = $Status; reason = $Reason
        decided_by = $DecidedBy; decided_at = (Get-IsoNow)
    }
    $json = ([pscustomobject]$rec | ConvertTo-Json -Depth 4 -Compress)
    Add-Content -LiteralPath (Get-AssignmentsPath -Root $Root) -Value $json -Encoding utf8
    Write-ActionLog -Root $Root -Level 'STATUS' -Message "Assign $Id -> $Project ($Status) by $DecidedBy"
}

function Get-EnrichmentsPath {
    # Append-only overlay of DERIVED fields (e.g. converted_md) produced by the
    # compiler/converter — keeps the master index immutable.
    param([Parameter(Mandatory)][string]$Root)
    $dir = Join-Path $Root '_INDEX'
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir 'enrichments.ndjson')
}

# Fields the converter/compiler may patch via the enrichment overlay.
$script:EnrichableFields = @('converted_md', 'purpose', 'contains', 'related_sessions', 'related_files')

function Set-ItemEnrichment {
    <#
      Append a derived-field update for one item. Never edits the master index.
    #>
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Field,
        [Parameter(Mandatory)][AllowEmptyString()]$Value,
        [string]$Note = ''
    )
    if ($script:EnrichableFields -notcontains $Field) { throw "Field '$Field' is not enrichable." }
    $rec = [ordered]@{ id = $Id; field = $Field; value = $Value; note = $Note; decided_at = (Get-IsoNow) }
    Add-Content -LiteralPath (Get-EnrichmentsPath -Root $Root) -Value (([pscustomobject]$rec) | ConvertTo-Json -Depth 5 -Compress) -Encoding utf8
    Write-ActionLog -Root $Root -Level 'WRITE' -Message "Enrich $Id.$Field = $Value"
}

function Get-SessionDeltasPath {
    # Append-only store of SessionDeltas emitted by Save-Session. The Compiler
    # generates STATE/TODO/DECISIONS/CHANGELOG/SESSION_LOG/SKILLS_USED/snapshots
    # from these — Save-Session never writes those generated files itself.
    param([Parameter(Mandatory)][string]$Root)
    $dir = Join-Path $Root '_INDEX'
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir 'session_deltas.ndjson')
}

function Get-SessionDeltas {
    param([Parameter(Mandatory)][string]$Root, [string]$Project)
    $path = Get-SessionDeltasPath -Root $Root
    if (-not (Test-Path -LiteralPath $path)) { return @() }
    $all = Get-Content -LiteralPath $path -Encoding utf8 | ForEach-Object {
        if ([string]::IsNullOrWhiteSpace($_)) { return }
        try { $_ | ConvertFrom-Json } catch { }
    }
    if ($Project) { $all = $all | Where-Object { $_.project -eq $Project } }
    return @($all)
}

function Add-SessionDelta {
    <#
      Append one SessionDelta. Returns the delta (with a unique snapshot name).
    #>
    param([Parameter(Mandatory)][string]$Root, [Parameter(Mandatory)][hashtable]$Delta)
    # Ensure a unique snapshot name across this project's existing deltas.
    $existing = @(Get-SessionDeltas -Root $Root -Project $Delta.project | ForEach-Object { $_.snapshot })
    if ($existing -contains $Delta.snapshot) {
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($Delta.snapshot)
        $n = 1
        do { $cand = "${baseName}_$n.md"; $n++ } while ($existing -contains $cand)
        $Delta.snapshot = $cand
    }
    $json = ([pscustomobject]$Delta | ConvertTo-Json -Depth 6 -Compress)
    Add-Content -LiteralPath (Get-SessionDeltasPath -Root $Root) -Value $json -Encoding utf8
    Write-ActionLog -Root $Root -Level 'CREATE' -Message "SessionDelta for '$($Delta.project)': $($Delta.snapshot)"
    return $Delta
}

function Resolve-BucketDir {
    <#
      Map a project/bucket name to its folder. Reserved buckets get special dirs
      so uncertain data is never placed under Projects\.
    #>
    param([Parameter(Mandatory)][string]$Root, [Parameter(Mandatory)][string]$Name)
    switch ($Name.ToUpperInvariant()) {
        'UNASSIGNED'   { return (Join-Path $Root '_STAGING') }
        'UNCLASSIFIED' { return (Join-Path $Root '_UNCLASSIFIED') }
        default        { return (Join-Path (Join-Path $Root 'Projects') $Name) }
    }
}

function Get-EffectiveRecords {
    <#
      Return the effective view of every indexed item: the immutable base record
      from master_index.ndjson merged with the latest assignment overlay
      (last-write-wins). Adapter-agnostic — the Compiler consumes only this.
    #>
    param([Parameter(Mandatory)][string]$Root)
    $indexPath = Get-IndexPath -Root $Root
    $base = [ordered]@{}
    if (Test-Path -LiteralPath $indexPath) {
        Get-Content -LiteralPath $indexPath -Encoding utf8 | ForEach-Object {
            if ([string]::IsNullOrWhiteSpace($_)) { return }
            try { $o = $_ | ConvertFrom-Json; if ($o.id) { $base[$o.id] = $o } } catch { }
        }
    }
    # Apply derived-field enrichments (converted_md, purpose, ...) first.
    $enrichPath = Get-EnrichmentsPath -Root $Root
    if (Test-Path -LiteralPath $enrichPath) {
        Get-Content -LiteralPath $enrichPath -Encoding utf8 | ForEach-Object {
            if ([string]::IsNullOrWhiteSpace($_)) { return }
            try {
                $e = $_ | ConvertFrom-Json
                if ($e.id -and $base.Contains($e.id) -and $e.field) {
                    $base[$e.id] | Add-Member -NotePropertyName $e.field -NotePropertyValue $e.value -Force
                }
            } catch { }
        }
    }

    $assignPath = Get-AssignmentsPath -Root $Root
    if (Test-Path -LiteralPath $assignPath) {
        Get-Content -LiteralPath $assignPath -Encoding utf8 | ForEach-Object {
            if ([string]::IsNullOrWhiteSpace($_)) { return }
            try {
                $a = $_ | ConvertFrom-Json
                if ($a.id -and $base.Contains($a.id)) {
                    $base[$a.id].project = $a.project
                    $base[$a.id].status = $a.status
                    if ($a.reason) { $base[$a.id].needs_review_reason = $a.reason }
                }
            } catch { }
        }
    }
    return @($base.Values)
}

function Add-IndexRecord {
    <#
      Append one record (hashtable) as a JSON line. Caller supplies the fields;
      this fills defaults and enforces the canonical shape.
    #>
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][hashtable]$Record
    )
    $defaults = [ordered]@{
        id                  = ''
        ingested_at         = (Get-IsoNow)
        type                = 'other'
        source              = 'files'
        project             = 'UNASSIGNED'
        title               = ''
        date_added          = (Get-Date -Format 'yyyy-MM-dd')
        sha256              = ''
        bytes               = 0
        ext                 = ''
        contains            = ''
        purpose             = $null
        status              = 'NEEDS_REVIEW'
        raw_path            = ''
        original_path       = ''
        converted_md        = $null
        related_sessions    = @()
        related_files       = @()
        source_ref          = 'local'
        needs_review_reason = 'unassigned project'
    }
    foreach ($k in $Record.Keys) { $defaults[$k] = $Record[$k] }

    $indexPath = Get-IndexPath -Root $Root
    $json = ([pscustomobject]$defaults | ConvertTo-Json -Depth 6 -Compress)
    Add-Content -LiteralPath $indexPath -Value $json -Encoding utf8
    Write-ActionLog -Root $Root -Level 'CREATE' -Message "Indexed [$($defaults.type)] $($defaults.title) (id=$($defaults.id))"
    return $defaults
}

# ---------------------------------------------------------------------------
# Markdown card
# ---------------------------------------------------------------------------

function Write-AssetCard {
    <#
      Render a compact, human-readable card for an indexed asset into
      _INDEX/assets/<id>.md. Never overwrites without backup (via Write-TextFile).
    #>
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)]$Record   # pscustomobject or hashtable from Add-IndexRecord
    )
    $cardsDir = Join-Path (Join-Path $Root '_INDEX') 'assets'
    if (-not (Test-Path -LiteralPath $cardsDir)) { New-Item -ItemType Directory -Path $cardsDir -Force | Out-Null }
    $card = Join-Path $cardsDir ("$($Record.id).md")

    $related = if ($Record.related_sessions) { ($Record.related_sessions -join ', ') } else { '(none)' }
    $body = @"
# Asset: $($Record.title)

- **id:** $($Record.id)
- **type:** $($Record.type)
- **source:** $($Record.source)
- **project:** $($Record.project)
- **status:** $($Record.status)
- **date added:** $($Record.date_added)
- **size:** $($Record.bytes) bytes
- **sha256:** $($Record.sha256)
- **contains:** $($Record.contains)
- **purpose:** $(if ($Record.purpose) { $Record.purpose } else { '_(set during audit)_' })
- **current location (raw):** $($Record.raw_path)
- **original path:** $($Record.original_path)
- **converted markdown:** $(if ($Record.converted_md) { $Record.converted_md } else { '_(none)_' })
- **related sessions:** $related
- **needs review:** $($Record.needs_review_reason)
"@
    Write-TextFile -Path $card -Content $body -Root $Root
    return $card
}

# ---------------------------------------------------------------------------
# Conversation cards (cold-archive transcript + hot-set compact card)
# ---------------------------------------------------------------------------

function Write-ConversationCard {
    <#
      Render a compact card for an indexed conversation into
      _INDEX/conversations/<id>.md. The card is what normal work reads; the full
      transcript lives in the cold archive (raw_path) and is loaded only on demand.
    #>
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)]$Record
    )
    $dir = Join-Path (Join-Path $Root '_INDEX') 'conversations'
    if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $card = Join-Path $dir ("$($Record.id).md")

    $body = @"
# Conversation: $($Record.title)

- **id:** $($Record.id)
- **source:** $($Record.source)
- **project:** $($Record.project)
- **status:** $($Record.status)
- **date:** $($Record.date_added)
- **messages:** $($Record.contains)
- **transcript (cold archive):** $($Record.raw_path)

## Preview

$(if ($Record.purpose) { $Record.purpose } else { '_(extractive preview unavailable)_' })

> Full summary is produced during the one-time Audit (LLM-assisted). Until then
> this card + the preview are what should be read — not the full transcript.
"@
    Write-TextFile -Path $card -Content $body -Root $Root
    return $card
}

# ---------------------------------------------------------------------------
# Light content probes (deterministic, no LLM)
# ---------------------------------------------------------------------------

function Get-ZipManifest {
    <#
      Return a short "contains" description for a ZIP: entry count + a sample of
      top-level names. Read-only; does not extract.
    #>
    param([Parameter(Mandatory)][string]$Path)
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue
        $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
        try {
            $entries = @($zip.Entries)
            $top = $entries | ForEach-Object { ($_.FullName -split '[\\/]')[0] } | Sort-Object -Unique | Select-Object -First 8
            return ("{0} entries; top-level: {1}" -f $entries.Count, ($top -join ', '))
        } finally { $zip.Dispose() }
    } catch {
        return 'archive (manifest unreadable)'
    }
}
