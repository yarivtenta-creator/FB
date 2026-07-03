# PUBLISH VALIDATION — 2026-07-03

## Summary
| Metric | Value |
|--------|-------|
| Total projects | 2 |
| Total records | 13 |
| Modules (consolidated) | 1 |
| Merged duplicates (archived into modules) | 4 |
| Archived history (records) | 4 |
| Unresolved (UNASSIGNED + pending approvals) | 1  (unassigned 1, pending 0) |
| UNCLASSIFIED items | 1 |
| Hot-tier total | 1671 tok (~6685 bytes) |
| Cold history total | 308 tok (~1233 bytes) |
| Overall token reduction (this sample) | 15.6% (hot vs hot+cold; sample history is tiny) |
| **Projected reduction (real history)** | **57.4%** (at ~1,500 tok/conversation × 6) |

> The hot tier (1671 tok) is loaded every turn instead of re-reading raw
> history. In this sample the archived transcripts are tiny; with real
> conversation histories the cold tier dominates and the reduction approaches the projected figure.

## Per-project
| Project | Records | Active | Archived | Modules | Hot (tok) | Cold (tok) | Verified |
|---------|---------|--------|----------|---------|-----------|-----------|----------|
| Skill Safety | 4 | 0 | 4 | 1 | 845 | 130 | PASS |
| Vinyl Lab | 7 | 7 | 0 | 0 | 826 | 178 | PASS |

## Buckets
- UNASSIGNED (awaiting audit): 1
- UNCLASSIFIED (uncertain, parked): 1

## Result: ALL PROJECTS VERIFIED — PUBLISH OK
