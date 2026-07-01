# SECRETS SCAN REPORT — EDIT VALUE LOCAL SDR MINI

**Scan Date**: 2026-06-10  
**Branch**: claude/gifted-babbage-cekfrh  
**Scope**: app/, config/, .env.example, requirements.txt  

---

## 1. API Keys / Tokens (regex: sk-*, AIza*, AKIA*, ghp_*, glpat-*)

```
RESULT: NONE FOUND
```

---

## 2. Hardcoded Passwords

```
RESULT: NONE FOUND
```
No `password = "..."` assignments outside of UI form type="password" attributes.

---

## 3. Personal Emails

```
RESULT: MOCK DATA ONLY — NOT PERSONAL
```

Emails found are fictional demo addresses in `app/frontend/mock_data.py` and `app/main.py`:
- sarah@goldenhourfilms.com — fictional business
- marco@luminarastudio.it — fictional business
- emma@frameandstory.co.uk — fictional business
- jessica@bloomphotography.com.au — fictional business
- giulia@luceeterna.it — fictional business
- pierre@nuitblanche.fr — fictional business
- k.weber@waldlicht.de — fictional business
- camille@studiomiroir.fr — fictional business
- sophie@velvetlens.co.uk — fictional business

All are demo seed data. No real personal emails present.

---

## 4. Personal URLs

```
RESULT: NONE FOUND
```
No personal URLs (yariv, tenta, personal domains) found anywhere in project.

---

## 5. Hardcoded Local Paths

```
RESULT: NONE FOUND
```
No `/home/user`, `/root/`, `C:\Users\`, or machine-specific paths in application code.  
`DB_PATH=data/sdr.db` in `.env.example` is a relative path — correct.

---

## 6. Hardcoded Usernames / Machine References

```
RESULT: NONE FOUND
```

---

## 7. .env File Status

```
.env NOT committed to repository — CORRECT
.env.example committed — contains only placeholders and defaults:

  AI_MODE=mock
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=llama3.2
  ADSPOWER_ENABLED=false
  ADSPOWER_BASE_URL=http://local.adspower.net:50325
  ADSPOWER_API_KEY=
  ADSPOWER_AUTOMATION_ALLOWED=false
  DB_PATH=data/sdr.db
```

---

## 8. Sensitive Files in ZIP

```
RESULT: NONE FOUND
.env — NOT in ZIP
*.db — NOT in ZIP
credentials.* — NOT in ZIP
secrets.* — NOT in ZIP
```

---

## 9. External Dependency Risk

```
app/frontend/theme.py: @import url('https://fonts.googleapis.com/...')
STATUS: LOW RISK
REASON: Font import only — no data sent, no auth required.
         App works offline with system font fallback (fallback comment added).
         No user data transmitted to Google.
```

---

## 10. Verdict

| Category | Status |
|---|---|
| API keys | CLEAN |
| Tokens | CLEAN |
| Passwords | CLEAN |
| Personal emails | CLEAN (mock data only) |
| Personal URLs | CLEAN |
| Local paths | CLEAN |
| Usernames | CLEAN |
| .env committed | CLEAN |
| DB in ZIP | CLEAN |
| Sensitive files in ZIP | CLEAN |

**SECURITY SCAN: PASSED — No secrets, credentials, or personal data found.**
