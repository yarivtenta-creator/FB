# P001 — GPT_RECOVERY_INDEX (ChatGPT-side)

ChatGPT-side sources for 247tiket / Travel Layout.

## Status: PENDING_IMPORT

No ChatGPT export has been dropped into `05_IMPORT_INBOX/` yet, so no ChatGPT source is
confirmed. This index is a placeholder ready to be filled by the import pipeline.

## What to export from ChatGPT (operator action)

- Any 247tiket / travel booking / travel layout design threads.
- Threads containing: page structure decisions, copy, pricing, booking flow, brand/visual
  direction, or generated HTML/assets.

## Import target

Drop exports into `05_IMPORT_INBOX/` with `247tiket` and `P001` in the filename or first line.
The classify step will extract decisions/assets/open questions and merge them into
`SOURCES/` with hashes; raw files move to `ARCHIVE/`.

Until then, ChatGPT recovery for P001 = 0% captured.
