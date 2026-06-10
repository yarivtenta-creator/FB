# INSTALLATION GUIDE — EDIT VALUE LOCAL SDR MINI

---

## Requirements

- Python 3.11 or higher
- Internet connection (for pip install only)
- Windows 10/11, macOS 12+, or Ubuntu 20.04+

---

## Step 1 — Get the files

**Option A: From ZIP**

1. Download `edit-value-sdr-mini-v1.0.0.zip`
2. Right-click → Extract All (Windows) or double-click (Mac)
3. Open the extracted folder

**Option B: From GitHub**

```
git clone https://github.com/yarivtenta-creator/FB.git
cd FB
git checkout claude/gifted-babbage-cekfrh
```

---

## Step 2 — Install Python packages

Open a terminal / command prompt inside the project folder.

```
pip install -r requirements.txt
```

This installs:
- streamlit
- pandas
- plotly
- requests
- python-dotenv

---

## Step 3 — Configure environment (optional)

```
copy .env.example .env       (Windows)
cp .env.example .env          (Mac/Linux)
```

The default `.env` works with no changes. Edit only if you want Ollama or AdsPower.

---

## Step 4 — Launch

**Windows:**
```
run_local.bat
```
Or:
```
streamlit run app/main_frontend.py
```

**Mac/Linux:**
```
./run_local.sh
```
Or:
```
streamlit run app/main_frontend.py
```

---

## Step 5 — First run

Your browser opens at `http://localhost:8501`.

A 6-step Setup Wizard guides you through:
1. Welcome
2. Company name and country
3. Default language
4. AI provider choice
5. AdsPower (optional)
6. Trello (optional)

---

## Verify installation

After the wizard completes, you should see:
- Dashboard with 12 demo leads
- Sidebar with 10 navigation items
- Status bar showing "AI: MOCK" and "AdsPower: OFF"

---

## Uninstall

Delete the project folder. No system files are modified.
