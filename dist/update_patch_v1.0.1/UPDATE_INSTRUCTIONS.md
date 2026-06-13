# UPDATE INSTRUCTIONS — v1.0.1 Patch

---

## Before you start

> **WARNING — Read before copying any files**
>
> This update replaces only `app/frontend/data_bridge.py`.
>
> It will NOT overwrite:
> - `.env` (your API keys and settings)
> - `data/` (your SQLite database)
> - `app/imports/` (your CSV imports)
> - `app/exports/` (your CSV exports)
> - `backups/` (your database backups)
> - Any other file not listed in this patch

---

## Step 1 — Close the running app

In the terminal where the app is running, press `Ctrl + C` to stop it.

---

## Step 2 — Back up your project folder (recommended)

**Windows:**
```
xcopy "C:\path\to\your\FB" "C:\path\to\your\FB_backup_before_patch" /E /I
```

**Mac/Linux:**
```
cp -r ~/FB ~/FB_backup_before_patch
```

---

## Step 3 — Extract the update ZIP

Extract `edit-value-sdr-mini-update-v1.0.1.zip` anywhere on your machine.

You will see:
```
update_patch_v1.0.1/
  app/
    frontend/
      data_bridge.py
  PATCH_NOTES.md
  UPDATE_INSTRUCTIONS.md
  TEST_REPORT.md
```

---

## Step 4 — Copy the patch file

Copy ONLY the files listed below into your existing project folder.

**Windows (Command Prompt) — run from inside the extracted folder:**
```
copy app\frontend\data_bridge.py "C:\path\to\your\FB\app\frontend\data_bridge.py"
```

**Mac/Linux — run from inside the extracted folder:**
```
cp app/frontend/data_bridge.py ~/FB/app/frontend/data_bridge.py
```

When prompted "Overwrite?", type `Y` and press Enter.

---

## Step 5 — Restart the app

```
streamlit run app/main_frontend.py
```

The app should open at `http://localhost:8501` with no ImportError.

---

## Step 6 — Verify

- Dashboard loads and shows the Lead Growth chart
- No error messages in the terminal
- All other pages still work

---

## Safety checklist

After applying the patch, confirm the following files are unchanged:

| File | Should still exist | Should not be overwritten |
|---|---|---|
| `.env` | ✓ | ✓ |
| `data/sdr.db` | ✓ | ✓ |
| `app/imports/` | ✓ | ✓ |
| `app/exports/` | ✓ | ✓ |
| `backups/` | ✓ | ✓ |

---

## If something goes wrong

Restore from your backup:

**Windows:**
```
xcopy "C:\path\to\your\FB_backup_before_patch" "C:\path\to\your\FB" /E /I /Y
```

**Mac/Linux:**
```
cp -r ~/FB_backup_before_patch/. ~/FB/
```
