# System Architecture

## Stack
- **Frontend**: Streamlit (Python)
- **Database**: SQLite (local file)
- **AI**: Ollama (optional) + Mock fallback
- **Browser Automation**: AdsPower Local API (optional)
- **Storage**: Local filesystem

## Layers

```
┌─────────────────────────────────────┐
│           Streamlit Pages            │
│  Dashboard │ Leads │ AI │ Approvals │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│              Services               │
│ LeadService │ OutreachService │ ... │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│               Agents                │
│ LeadProfile │ ContentAnalysis │ ... │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│             Adapters                │
│  AIClient (Mock/Ollama) │ AdsPower  │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│            SQLite DB                │
│         (data/sdr.db)               │
└─────────────────────────────────────┘
```

## Data Flow

1. User adds lead → LeadService → DB
2. User triggers analysis → Agent → AIClient → DB (saves profile)
3. Agent generates draft → OutreachService → DB (saves draft)
4. Draft enters approval queue → User approves/rejects
5. Approved draft → Activity logged
6. AdsPower: User manually opens browser profile for approved lead

## Key Design Decisions
- All AI calls are async-safe but run synchronously in Streamlit
- Mock AI returns structured placeholder responses for offline use
- AdsPower is disabled by default; enabled via settings
- All mutations are logged to activities table
