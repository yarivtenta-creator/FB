# Installation Plan

## Requirements
- Python 3.10+
- pip
- Optional: Ollama (https://ollama.com)

## Steps
```bash
cd edit-value-local-sdr
pip install -r requirements.txt
cp .env.example .env
streamlit run app/main.py
```

## Optional Ollama Setup
```bash
ollama pull llama3.2
# Set AI_MODE=ollama in .env
```
