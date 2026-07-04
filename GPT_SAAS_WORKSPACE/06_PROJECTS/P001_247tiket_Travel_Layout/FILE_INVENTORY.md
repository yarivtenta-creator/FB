# P001 — FILE_INVENTORY

Every known file/asset for 247tiket / Travel Layout, and whether it is captured in the system.

| File / asset | Location | Type | Captured in SOURCES? | Notes |
|--------------|----------|------|----------------------|-------|
| PROJECT_STATE.md (prior) | Drive `P001-247tiket-travel-layout/` | md | Yes (reconciled) | v1 state, superseded by this v2 |
| SOURCES/ (Drive) | Drive `P001-247tiket-travel-layout/SOURCES/` | folder | Referenced | empty at last check |
| ARCHIVE/ (Drive) | Drive `P001-247tiket-travel-layout/ARCHIVE/` | folder | Referenced | empty at last check |
| EXPORTS/ (Drive) | Drive `P001-247tiket-travel-layout/EXPORTS/` | folder | Referenced | empty — no export yet (correct) |
| Candidate branch: tenta-launch-setup | git `claude/tenta-launch-setup-l4h420` | code | No — to fetch | most likely current source |
| Candidate branch: html merge | git `claude/html-website-merge-package-dh4fio` | code | No — to fetch | possible assets |
| Candidate branch: index homepage | git `claude/build-index-homepage-6psau0` | code | No — to fetch | possible layout |
| Historical Claude chats | Claude | chat | No — PENDING_IMPORT | export to inbox |
| Historical ChatGPT threads | ChatGPT | chat | No — PENDING_IMPORT | export to inbox |
| Operator current materials | TBD | TBD | No — AWAITING DROP (T1) | highest priority |

## Gaps

- **No source code fetched into `SOURCES/` yet.** The actual Travel Layout HTML/assets are not
  in this project folder. First recovery step (RECOVERY_PROTOCOL step 4) is to fetch the
  candidate git branches and inventory their real files here.
- Drive P001 SOURCES/ARCHIVE/EXPORTS were empty at last check — the material lives in chats and
  git branches, not yet consolidated.

## Update rule

When a branch/chat is fetched, replace its row with the actual files it contains (path, type,
hash), and mark "Captured in SOURCES? = Yes".
