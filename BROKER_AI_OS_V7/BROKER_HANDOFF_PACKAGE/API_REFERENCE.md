# API REFERENCE — Broker AI OS v2

All `/api/*` routes require auth (`x-auth-token` header or `auth` cookie). Without it → **401**.
Get a token: `POST /api/auth/login {username,password}` → `{ ok, token, role }`.

## Auth
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | obtain session token |
| POST | `/api/auth/logout` | end session |
| GET | `/api/auth/whoami` | current identity + permissions |

## Data layer (`/api/data`, read-only or paper-simulation)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/data/hub/health` | hub status: `data_mode, source, freshness, providers, symbols` |
| GET | `/api/data/quotes` | normalized quotes (mock, or live read-only when configured) |
| GET | `/api/data/signals` | signals from the hub (`source:data_hub_v2`) |
| GET | `/api/data/signals/ranked` | ranked signals with `factors` |
| GET | `/api/data/providers` | provider list (id, links, configured, enabled, status) |
| GET | `/api/data/providers/summary` | counts incl. `data_mode`, `configured` |
| GET | `/api/data/providers/:id/status` | single provider |
| POST | `/api/data/providers/:id/test` | **read-only** probe (real GET in live mode; no orders) |
| GET | `/api/data/paper/trades` | paper trades (`paper:true`) |
| GET | `/api/data/paper/stats` | paper stats (`paper:true`) |
| POST | `/api/data/paper/open` | open paper trade `{symbol,side,qty}` |
| POST | `/api/data/paper/close` | close paper trade `{id}` |
| GET | `/api/data/paper/candidates` | governance-approved → paper candidates (`paper:true,executed:false`) |
| POST | `/api/data/paper/candidates/:id/simulate` | simulate candidate → paper trade |
| GET | `/api/data/paper/bridge/stats` | bridge stats + candidate count |
| GET | `/api/data/performance` | aggregated mock performance |

## Governance (`/api/gov`, status-change only — never places an order)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/gov/status` | execution mode + safety flags |
| GET | `/api/gov/orders` | pending/approved orders (gate flag) |
| POST | `/api/gov/orders/:id/approve` | open the gate (`execution_allowed:true, executed:false`) |
| POST | `/api/gov/orders/:id/reject` | keep gate closed |
| GET | `/api/gov/history` / `/api/gov/audit` | decision history / audit |

## Other
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health/full` | 11-point system health |
| GET | `/api/t4/mock` | T4 mock futures (data only) |
| GET | `/api/n8n/registry` | n8n template registry |
| GET | `/docs/operator/*.md` | operator guides (static) |

There is intentionally **no** order/execution endpoint anywhere in the system.
</content>
