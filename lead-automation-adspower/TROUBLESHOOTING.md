# TROUBLESHOOTING — EDIT VALUE LOCAL SDR MINI

---

## Installation Problems

### "streamlit is not recognized"

**Cause**: Streamlit was not installed, or Python's Scripts folder is not in PATH.

**Fix**:
```
pip install streamlit
```
If that fails, try:
```
python -m pip install streamlit
```
Then run with:
```
python -m streamlit run app/main_frontend.py
```

---

### "No such file or directory: requirements.txt"

**Cause**: You are not in the project folder.

**Fix**: Navigate into the project folder first:
```
cd FB                    (if cloned from GitHub)
cd edit-value-sdr-mini   (if extracted from ZIP)
```
Then run `pip install -r requirements.txt`.

---

### "ModuleNotFoundError: No module named 'streamlit'"

**Cause**: pip installed to a different Python than the one running the app.

**Fix**:
```
python -m pip install -r requirements.txt
python -m streamlit run app/main_frontend.py
```

---

### pip install fails with permission error

**Fix** (Windows):
```
pip install -r requirements.txt --user
```

**Fix** (Mac/Linux):
```
pip install -r requirements.txt --user
```

---

## App Startup Problems

### Browser does not open automatically

**Fix**: Open your browser manually and go to `http://localhost:8501`

---

### Port 8501 already in use

**Fix**:
```
streamlit run app/main_frontend.py --server.port 8502
```
Then open `http://localhost:8502`

---

### Setup Wizard keeps reappearing

**Cause**: The wizard was not completed fully (Close button used instead of Finish).

**Fix**: Complete all 6 wizard steps and click **Launch Dashboard** on the final step.

If you need to reset the wizard:
```python
python -c "
import os; os.environ['DB_PATH']='data/sdr.db'
from app.database.db import set_setting
set_setting('setup_complete','true')
print('Done')
"
```

---

### App shows blank page or error on startup

**Fix**: Delete `data/sdr.db` and restart — the database will be recreated fresh.

**Warning**: This deletes all your leads and settings.

---

## AI Problems

### "Ollama not reachable"

**Cause**: Ollama is not running, or AI_MODE is set to ollama but Ollama is not installed.

**Fix option 1**: Switch to Mock AI in Settings → AI Engine → click **Use Mock AI**

**Fix option 2**: Start Ollama:
```
ollama serve
```

**Fix option 3**: Check AI_MODE in `.env`:
```
AI_MODE=mock
```

---

### Drafts look too generic

**Cause**: Mock AI generates template responses. Real variation requires Ollama.

**Fix**: Install Ollama, pull llama3.2, switch to Ollama in Settings.

---

## Trello Problems

### "Trello returned 401"

**Cause**: API key or token is wrong.

**Fix**: Get fresh credentials from https://trello.com/app-key. Both key and token are required.

---

### "Cards not appearing in Trello"

**Cause**: Wrong Board ID, or board doesn't have matching lists.

**Fix**: Verify Board ID in Trello URL (the alphanumeric string after /b/). Lists must exist on the board.

---

## AdsPower Problems

### "AdsPower not reachable"

**Cause**: AdsPower desktop app is not running.

**Fix**: Open AdsPower and ensure it is running. The local API starts automatically on port 50325.

---

### AdsPower tab shows "Connection Error"

**Cause**: `ADSPOWER_ENABLED` is still false in .env.

**Fix**: Edit `.env`:
```
ADSPOWER_ENABLED=true
```
Restart the app.

---

## Data Problems

### "I accidentally deleted my leads"

**Fix**: Restore from backup if you have one (`data/sdr.db` backup).

To enable automatic backups, run `backup.bat` (Windows) or `./backup.sh` (Mac/Linux) regularly.

---

### CSV import shows 0 leads imported

**Cause**: CSV format does not match required columns, or file encoding is wrong.

**Fix**: Ensure the CSV has a header row with at minimum `business_name`. Save as UTF-8.

---

## Performance

### App is slow to load

**Cause**: First load initialises the database and seeds demo data.

**Fix**: Normal — subsequent loads are faster. Close unused browser tabs.

---

## Getting Help

- Check `docs/` folder for architecture and system documentation
- Review `CUSTOMER_README.md` for full feature reference
- File an issue at the project GitHub repository
