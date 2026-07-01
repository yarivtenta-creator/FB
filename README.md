# FB — Consolidated Workspace

All work that was previously scattered across **16 separate chat/session branches**
has been collected here into **one place**, grouped by project. Nothing was deleted
from the original branches — this is a consolidation, so each chat's files live
side‑by‑side under its own folder and nothing collides.

- **Source branches:** 16 `claude/*` branches (see table below)
- **Consolidated into:** 6 project groups / 816 files
- **This branch:** `claude/data-collection-chat-consolidation-qpkvh7`

---

## Project groups

### 🎵 `vinyl-lab-website/` — The Vinyl Lab Israel (RTL Hebrew website)
Six chats all worked on the same vinyl‑record production company website, from
different angles. `merged-full-site/` is the most complete package.

| Folder | Source chat | What it is |
|---|---|---|
| `merged-full-site/` | html-website-merge-package | Full merged & packaged HTML site (most complete) |
| `self-contained-preview/` | vinyl-lab-html-preview | Single self‑contained `index.html` (inline CSS+JS) |
| `multipage/` | bold-goldberg | Multi‑page site (`pages/` folder, contact details) |
| `homepage/` | build-index-homepage | Standalone RTL Hebrew homepage |
| `before-you-call/` | before-you-call-page | "Before you call" page (replaces FAQ) |
| `gift-cards/` | gift-cards-html-build | Custom vinyl gift‑card page |

### 📈 `broker-ai-os/` — Broker AI OS V7 (trading system)
| Folder | Source chat | What it is |
|---|---|---|
| `v7-full/` | admiring-maxwell | Full BROKER_AI_OS_V7 package, proofs, handoff docs |
| `alpaca-provider/` | affectionate-edison | Alpaca provider layer + dashboard panels + tests |

### 🤝 `scalexl-clientflow/` — ScaleXL ClientFlow / CRM / AI Growth OS
| Folder | Source chat | What it is |
|---|---|---|
| `ai-growth-os/` | tenta-launch-setup | AI Growth OS — runtime, registries, agents (largest, 58 commits) |
| `agent-pack/` | serene-noether | ClientFlow Agent Pack (10 agents, schemas, user manual) |
| `crm-bulk-leads/` | crm-client-bulk-leads | CRM client ownership + bulk lead actions + intake linking |

### 🧬 `project-770/` — Project 770 intelligence modules
| Folder | Source chat | What it is |
|---|---|---|
| `module/` | project-770-module | Viroscope module, registry, session build log |
| `complete/` | project770-complete | Reference docs + complete rundown |

### 🐍 `lead-automation-adspower/` — Lead automation (Python)
| Source chat | What it is |
|---|---|
| gifted-babbage | Python app: AdsPower client, AI agents, CRM, frontend, v1.0.0 delivery |

### 🧰 `prompts-and-workflows/`
| Folder | Source chat | What it is |
|---|---|---|
| `n8n-workflows/` | download-chatgpt-prompts | Curated n8n workflow lists (md + json) |
| `sintra-extract/` | peaceful-feynman | Sintra Notion prompt‑library extraction script |

---

## Full chat → folder map

| Date | Source branch (chat) | Commits | Consolidated folder |
|---|---|---|---|
| 2026-07-01 | claude/html-website-merge-package-dh4fio | 2 | `vinyl-lab-website/merged-full-site/` |
| 2026-07-01 | claude/vinyl-lab-html-preview-rs0x2b | 15 | `vinyl-lab-website/self-contained-preview/` |
| 2026-07-01 | claude/build-index-homepage-6psau0 | 2 | `vinyl-lab-website/homepage/` |
| 2026-07-01 | claude/before-you-call-page-16g09z | 2 | `vinyl-lab-website/before-you-call/` |
| 2026-07-01 | claude/gift-cards-html-build-mwbs49 | 2 | `vinyl-lab-website/gift-cards/` |
| 2026-06-14 | claude/bold-goldberg-g2lbw4 | 8 | `vinyl-lab-website/multipage/` |
| 2026-06-24 | claude/admiring-maxwell-5j39m8 | 9 | `broker-ai-os/v7-full/` |
| 2026-06-03 | claude/affectionate-edison-BG8AA | 10 | `broker-ai-os/alpaca-provider/` |
| 2026-06-26 | claude/tenta-launch-setup-l4h420 | 58 | `scalexl-clientflow/ai-growth-os/` |
| 2026-06-20 | claude/serene-noether-ztaiws | 9 | `scalexl-clientflow/agent-pack/` |
| 2026-06-29 | claude/crm-client-bulk-leads-9iic59 | 2 | `scalexl-clientflow/crm-bulk-leads/` |
| 2026-06-26 | claude/project-770-module-jp6vfw | 3 | `project-770/module/` |
| 2026-06-26 | claude/project770-complete-n8k3yb | 4 | `project-770/complete/` |
| 2026-06-13 | claude/gifted-babbage-cekfrh | 16 | `lead-automation-adspower/` |
| 2026-06-26 | claude/download-chatgpt-prompts-rtizje | 3 | `prompts-and-workflows/n8n-workflows/` |
| 2026-06-14 | claude/peaceful-feynman-7h748j | 3 | `prompts-and-workflows/sintra-extract/` |

_Notes: `__pycache__`, `.pyc`, and `.claude/` worktree artifacts were dropped during
consolidation. Each folder keeps its original `README.md` / report files intact._
