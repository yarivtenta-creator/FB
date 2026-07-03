# Phase 0 Ingestion — demo output

Real output from ingesting a sample asset folder (a website ZIP, a PDF, a PNG,
CSV, Markdown, text, and loose HTML/CSS/JS). Reproduce it with:

```powershell
# 1. Ingest a folder (copies originals to _RAW, indexes each, writes cards)
.\scripts\import\Import-Files.ps1 -Path "C:\path\to\assets"

# 2. Retrieve without reading any conversation history
.\scripts\import\Search-Index.ps1 -Query "final" -Type archive
.\scripts\import\Search-Index.ps1 -Query "homepage" -Type image
```

## Ingest run

```
Files ingestion complete.
  Imported : 9
  Duplicates skipped : 0
  Index    : GPT-Memory\_INDEX\master_index.ndjson
```

Running it again on the same folder detects exact duplicates by SHA-256:

```
  Imported : 0
  Duplicates skipped : 9
```

## One index record (`_INDEX/master_index.ndjson`, one JSON per line)

```json
{"id":"fe78b9858761","ingested_at":"2026-07-03 05:58","type":"archive",
 "source":"files","project":"UNASSIGNED","title":"vinyl_lab_FINAL_READY.zip",
 "date_added":"2026-07-03","sha256":"fe78b985...","bytes":699,"ext":".zip",
 "contains":"4 entries; top-level: site","purpose":null,"status":"NEEDS_REVIEW",
 "raw_path":"_RAW/files/2026-07-03/vinyl_lab_FINAL_READY.zip",
 "converted_md":null,"related_sessions":[],"source_ref":"local"}
```

## Retrieval — the token-saving lookup

Query: *"what ZIP had the final website?"*

```
1 match(es):
  vinyl_lab_FINAL_READY.zip  [archive]
    project : UNASSIGNED   status : NEEDS_REVIEW
    contains: 4 entries; top-level: site
    path    : _RAW/files/2026-07-03/vinyl_lab_FINAL_READY.zip  (exists)
```

Query: *"open the homepage image"*

```
1 match(es):
  homepage.png  [image]
    path    : _RAW/files/2026-07-03/homepage.png  (exists)
```

Both answers come from the structured index — **zero conversation transcripts
were read.** That is the token model in action: the answer is a path + a
one-line description, not a payload.
```
