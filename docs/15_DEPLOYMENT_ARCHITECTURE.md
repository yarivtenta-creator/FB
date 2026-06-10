# Deployment Architecture

## Deployment Modes

### Mode 1 — Local Single-User (Phase 1, current)

```
[User's Machine]
├── Python 3.10+
├── Streamlit (port 8501)
├── SQLite (data/sdr.db)
├── Optional: Ollama (port 11434)
└── Optional: AdsPower (port 50325)
```

**Start**: `streamlit run app/main.py`
**Config**: `.env` file
**Data**: local SQLite file
**Backup**: manual copy of `data/sdr.db`

---

### Mode 2 — Local Team Deployment (Phase 1.5)

One machine acts as server. Others connect via browser over LAN.

```
[Server Machine]
├── Python + Streamlit (0.0.0.0:8501)
├── SQLite → PostgreSQL (upgrade recommended)
└── Ollama (optional)

[Team Machines]
└── Browser → http://[server-ip]:8501
```

**Start**: `streamlit run app/main.py --server.address 0.0.0.0`
**Config**: shared `.env`
**Auth**: None in Phase 1 — use network-level access control
**Limitation**: Streamlit session state is not multi-user safe without auth

---

### Mode 3 — Docker Deployment (Phase 2 foundation)

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["8501:8501"]
    environment:
      - DB_URL=postgresql://...
    depends_on: [db, redis]

  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  ollama:          # optional
    image: ollama/ollama
    ports: ["11434:11434"]
```

---

### Mode 4 — Cloud SaaS Deployment (Phase 2)

```
[CDN / Load Balancer]
        │
[FastAPI App Servers (2+)]
        │
[PostgreSQL RDS / Supabase]
[Redis (sessions, cache)]
[S3 / R2 (file storage)]
        │
[Background Worker (Celery or ARQ)]
        │
[Ollama Cluster (optional GPU instances)]
```

**Hosting options**:
- Render.com (simplest, free tier available)
- Railway.app (developer-friendly)
- Fly.io (good for containerized apps)
- AWS / GCP / Azure (enterprise)

---

## Environment Strategy

Three environments:

| Environment | Purpose | DB | AI |
|---|---|---|---|
| local | Development | SQLite | Mock |
| staging | Pre-release testing | PostgreSQL (small) | Mock + Ollama |
| production | Live SaaS | PostgreSQL (HA) | Ollama cluster / OpenAI |

Environment is set via `APP_ENV` variable.
Each environment loads its own `.env.[environment]` file.

---

## Configuration Strategy

### Phase 1 (local)
All config in `.env` file. No secrets management service needed.

### Phase 2 (SaaS)
| Config Type | Storage |
|---|---|
| App config | Environment variables (injected by deployment platform) |
| Workspace secrets (AdsPower, Trello tokens) | DB, AES-256 encrypted column |
| Platform secrets (Stripe, SendGrid) | Secrets manager (AWS SSM or Doppler) |
| AI API keys | Secrets manager |

---

## Secrets Strategy

### Phase 1
- `.env` file (gitignored)
- `.env.example` committed (no real values)

### Phase 2
| Secret | Storage |
|---|---|
| DATABASE_URL | Deployment env var |
| REDIS_URL | Deployment env var |
| JWT_SECRET | Deployment env var (rotated monthly) |
| STRIPE_SECRET_KEY | Secrets manager |
| SENDGRID_API_KEY | Secrets manager |
| Workspace AdsPower key | DB encrypted (AES-256, key from env) |
| Workspace Trello token | DB encrypted |

**Rule**: No secret ever committed to git.
**Rule**: No secret logged to application logs.
**Rule**: Workspace secrets never appear in API responses.

---

## Backup Strategy

### Phase 1 (local)
- Document: `data/sdr.db` must be backed up manually
- Provide `backup.bat` / `backup.sh` script that copies DB to `backups/sdr_[date].db`

### Phase 2 (SaaS)
- PostgreSQL: automated daily snapshots (RDS or Supabase built-in)
- File storage: versioned S3 bucket
- Retention: 30 days of daily backups
- Point-in-time recovery: enabled on production PostgreSQL

---

## Dockerfile (Phase 2 template)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8501
CMD ["streamlit", "run", "app/main.py", "--server.address", "0.0.0.0"]
```
