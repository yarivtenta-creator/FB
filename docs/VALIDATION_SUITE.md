# FOUNDATION VALIDATION SUITE — 2026-07-03

Scale: conversations=2000, assets=2000, ideas=300

## Scenarios
| # | Scenario | Result | Detail |
|---|----------|--------|--------|
| 1 | Large project: hot-tier bounded | PASS | hot=2010 tok for 4000 records (budget < 8000); compile 0.88s |
| 2 | Multi-engine: identical content -> one canonical record | PASS | same conversation via ChatGPT+Claude deduped by content hash (records unchanged: 4001 -> 4001) |
| 3 | Duplicate stress: deterministic merge | PASS | two audit runs -> identical module members (180) & status |
| 4 | Duplicate stress: explainable + operator queue | PASS | report has core/candidate breakdown; queue present=True |
| 5 | Recovery: recompile is reproducible | PASS | two full compiles -> byte-identical generated files (22 files, ignoring timestamps) |
| 6 | Recovery: re-ingest raw is idempotent | PASS | re-ingesting raw history added 0 records (content-hash identity): 4301 -> 4301 |

## Performance
| Metric | Value |
|--------|-------|
| Ingest conversations (2000) | 17.57 s |
| Ingest assets (2000) | 7.29 s |
| Compile (BigProject) | 0.88 s |
| Publish (all) | 2.99 s |
| BigProject hot-tier | 2010 tok |
| Total records | 4301 |
| Archived history | 180 |
| Merged duplicates | 180 |
| Duplicate reduction | 4.2% of records archived |
| Memory footprint | 10.44 MB on disk |

## Result: ALL SCENARIOS PASSED — FOUNDATION VALIDATED
