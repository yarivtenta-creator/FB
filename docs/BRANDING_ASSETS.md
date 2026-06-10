# Branding Assets

## Logo File

| Property | Value |
|---|---|
| File | `app/assets/logo.svg` |
| Format | SVG (vector, scalable) |
| Dimensions | 240 × 48px (natural size) |
| Background | Transparent |

## Logo Design

The logo consists of two parts:

### Icon Mark
- Film frame shape with play button (▶) inside
- Background: indigo-to-purple gradient (`#6366f1` → `#8b5cf6`)
- Corner radius: 4px
- Four corner dots (film perforations)
- Represents video/film production

### Wordmark
- **EDIT VALUE** — 11px, weight 700, indigo (`#6366f1`), letter-spacing 2px
- **LOCAL SDR MINI** — 14px, weight 800, near-white (`#f8fafc`)

## Color System

| Color | Hex | Usage |
|---|---|---|
| Primary Accent | `#6366f1` | Buttons, nav active, borders, logo text |
| Accent Hover | `#818cf8` | Hover states |
| Secondary | `#8b5cf6` | Gradients, secondary highlights |
| Success | `#10b981` | Approved, connected, high score |
| Warning | `#f59e0b` | Pending, medium score |
| Danger | `#ef4444` | Rejected, errors, low score |
| Info | `#3b82f6` | Contacted, info states |
| Replied | `#8b5cf6` | Replied status |
| Background Primary | `#0f1117` | App background |
| Background Card | `#1e2130` | Cards, panels |
| Background Sidebar | `#13151f` | Sidebar |
| Text Primary | `#f1f5f9` | Headings, important text |
| Text Secondary | `#94a3b8` | Body text, labels |
| Text Muted | `#64748b` | Captions, metadata |
| Border | `rgba(255,255,255,0.07)` | Card borders |

## Typography

| Usage | Font | Size | Weight |
|---|---|---|---|
| App font | Inter (Google Fonts) | — | Variable |
| Page headings | Inter | 24px | 700 |
| Section headings | Inter | 18px | 600 |
| Body | Inter | 14px | 400 |
| Labels / caps | Inter | 11–12px | 500–600 |
| Metric values | Inter | 28px | 700 |

## Logo Placement

- **Sidebar top**: 36px icon + wordmark, padding 20px 16px
- **Browser tab**: 🎬 emoji favicon
- **Page title**: Streamlit page_icon="🎬"

## Logo Usage Rules

1. Always display on dark background (#13151f or darker)
2. Maintain aspect ratio — never stretch
3. Minimum display size: 160×32px
4. Clear space: at least 8px on all sides
5. Do not recolor the gradient icon
6. Do not use on light backgrounds without redesign

## Status Indicators (Sidebar Footer)

- AI Mode: shown with `⚡` icon + color (indigo = ollama, gray = mock)
- AdsPower: shown with "AdsPower: ON/OFF" (green = on, gray = off)
