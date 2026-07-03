<#
.SYNOPSIS
    GitHub adapter. Normalize repositories into canonical records. The repo IS
    the export — we index metadata + URL, never copy blobs.

.DESCRIPTION
    Emits canonical records only. Input is either a JSON file (array of repo
    objects from the GitHub API) OR live via -Owner (+ $env:GITHUB_TOKEN),
    calling https://api.github.com/users/<owner>/repos. Each repo becomes a
    record with type=repository and the clone/HTML URL as its location.

.PARAMETER Path
    JSON file: an array of repo objects (name, full_name, html_url, description,
    updated_at, language, private).

.PARAMETER Owner
    GitHub user/org to list repos for (uses the API). Ignored if -Path is given.

.PARAMETER Root
    Memory root. Defaults to $env:GPT_MEMORY_ROOT or <repo>\GPT-Memory.

.EXAMPLE
    .\Import-GitHub.ps1 -Path repos.json
.EXAMPLE
    $env:GITHUB_TOKEN="ghp_..."; .\Import-GitHub.ps1 -Owner myuser
#>
[CmdletBinding()]
param(
    [string]$Path,
    [string]$Owner,
    [string]$Root
)

. "$PSScriptRoot\..\common.ps1"
. "$PSScriptRoot\common-ingest.ps1"

$Root = Get-MemoryRoot -Root $Root

if ($Path) {
    if (-not (Test-Path -LiteralPath $Path)) { throw "File not found: $Path" }
    $data = Get-Content -LiteralPath $Path -Raw -Encoding utf8 | ConvertFrom-Json
}
elseif ($Owner) {
    $headers = @{ 'User-Agent' = 'gpt-memory'; 'Accept' = 'application/vnd.github+json' }
    if ($env:GITHUB_TOKEN) { $headers['Authorization'] = "Bearer $env:GITHUB_TOKEN" }
    $data = Invoke-RestMethod -Uri "https://api.github.com/users/$Owner/repos?per_page=100&sort=updated" -Headers $headers
}
else { throw "Provide -Path <repos.json> or -Owner <user>." }
if ($data -isnot [System.Array]) { $data = @($data) }

$seen = Get-IndexHashes -Root $Root
$imported = 0; $skipped = 0
foreach ($r in $data) {
    try {
        $props = $r.PSObject.Properties.Name
        $full = if ($props -contains 'full_name') { [string]$r.full_name } elseif ($props -contains 'name') { [string]$r.name } else { '(repo)' }
        $url = if ($props -contains 'html_url') { [string]$r.html_url } else { "https://github.com/$full" }
        $desc = if ($props -contains 'description') { [string]$r.description } else { '' }
        $lang = if ($props -contains 'language') { [string]$r.language } else { '' }
        $priv = if ($props -contains 'private') { [bool]$r.private } else { $false }
        $date = (Get-Date -Format 'yyyy-MM-dd')
        if (($props -contains 'updated_at') -and $r.updated_at) { try { $date = ([datetimeoffset]::Parse($r.updated_at)).ToString('yyyy-MM-dd') } catch { } }
        $sha = Get-StringSha256 -Text ("github|$full|$url")

        $rec = Add-CanonicalItem -Root $Root -Seen $seen -Record @{
            id = (New-IngestId $sha); type = 'repository'; source = 'github'
            project = 'UNASSIGNED'; title = $full; date_added = $date; sha256 = $sha; ext = ''
            contains = (@("lang: $lang", $(if ($priv) { 'private' } else { 'public' })) -join '; ')
            purpose = $desc; status = 'NEEDS_REVIEW'; raw_path = $url; original_path = $url
            source_ref = "github:$full"; needs_review_reason = 'unassigned project'
        }
        if ($rec) { $imported++ } else { $skipped++ }
    }
    catch { Write-ActionLog -Root $Root -Level 'WARN' -Message "GitHub repo failed: $($_.Exception.Message)" }
}

Write-Host ""
Write-Host "GitHub ingestion complete." -ForegroundColor Green
Write-Host ("  Imported : {0}   Duplicates : {1}" -f $imported, $skipped)
Write-ActionLog -Root $Root -Level 'INFO' -Message "Import-GitHub: $imported imported, $skipped dup"
