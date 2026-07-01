"""Global CSS theme for Edit Value Local SDR Mini."""


def inject_css():
    import streamlit as st
    st.markdown("""
<style>
/* ── Google Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
/* Fallback: system font stack used when offline */

/* ── Root Variables ── */
:root {
    --bg-primary: #0f1117;
    --bg-secondary: #1a1d27;
    --bg-card: #1e2130;
    --bg-card-hover: #252840;
    --bg-sidebar: #13151f;
    --accent: #6366f1;
    --accent-hover: #818cf8;
    --accent-light: rgba(99, 102, 241, 0.12);
    --accent-2: #8b5cf6;
    --success: #10b981;
    --success-light: rgba(16, 185, 129, 0.12);
    --warning: #f59e0b;
    --warning-light: rgba(245, 158, 11, 0.12);
    --danger: #ef4444;
    --danger-light: rgba(239, 68, 68, 0.12);
    --info: #3b82f6;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border: rgba(255,255,255,0.07);
    --border-focus: rgba(99, 102, 241, 0.5);
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 4px 24px rgba(0,0,0,0.35);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
}

/* ── Base Reset ── */
html, body, [class*="css"] {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

.stApp {
    background: var(--bg-primary) !important;
    color: var(--text-primary) !important;
}

/* ── Sidebar ── */
[data-testid="stSidebar"] {
    background: var(--bg-sidebar) !important;
    border-right: 1px solid var(--border) !important;
    padding-top: 0 !important;
}

[data-testid="stSidebar"] > div {
    padding-top: 0 !important;
}

[data-testid="stSidebarContent"] {
    padding: 0 !important;
}

/* ── Sidebar Buttons (Nav) ── */
[data-testid="stSidebar"] .stButton > button {
    width: 100% !important;
    background: transparent !important;
    color: var(--text-secondary) !important;
    border: none !important;
    border-radius: var(--radius-sm) !important;
    padding: 10px 16px !important;
    text-align: left !important;
    font-size: 13.5px !important;
    font-weight: 500 !important;
    transition: all 0.15s ease !important;
    margin-bottom: 2px !important;
}

[data-testid="stSidebar"] .stButton > button:hover {
    background: var(--accent-light) !important;
    color: var(--accent-hover) !important;
}

[data-testid="stSidebar"] .stButton > button[data-active="true"] {
    background: var(--accent-light) !important;
    color: var(--accent) !important;
}

/* ── Main Content Area ── */
.main .block-container {
    padding: 1.5rem 2rem 2rem 2rem !important;
    max-width: 1400px !important;
}

/* ── Typography ── */
h1 {
    font-size: 24px !important;
    font-weight: 700 !important;
    color: var(--text-primary) !important;
    margin-bottom: 4px !important;
    letter-spacing: -0.3px !important;
}

h2 {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
}

h3 {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
}

p, li, .stMarkdown {
    color: var(--text-secondary) !important;
    font-size: 14px !important;
}

/* ── Metric Cards ── */
[data-testid="metric-container"] {
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius) !important;
    padding: 20px !important;
    box-shadow: var(--shadow-sm) !important;
    transition: border-color 0.2s !important;
}

[data-testid="metric-container"]:hover {
    border-color: var(--accent-light) !important;
}

[data-testid="stMetricValue"] {
    color: var(--text-primary) !important;
    font-size: 28px !important;
    font-weight: 700 !important;
}

[data-testid="stMetricLabel"] {
    color: var(--text-muted) !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.8px !important;
}

[data-testid="stMetricDelta"] {
    font-size: 12px !important;
}

/* ── Buttons ── */
.stButton > button {
    background: var(--accent) !important;
    color: white !important;
    border: none !important;
    border-radius: var(--radius-sm) !important;
    font-weight: 600 !important;
    font-size: 13.5px !important;
    padding: 8px 18px !important;
    transition: all 0.15s ease !important;
    box-shadow: 0 2px 8px rgba(99,102,241,0.3) !important;
}

.stButton > button:hover {
    background: var(--accent-hover) !important;
    box-shadow: 0 4px 16px rgba(99,102,241,0.4) !important;
    transform: translateY(-1px) !important;
}

.stButton > button:active {
    transform: translateY(0) !important;
}

/* ── Secondary Button style via custom class ── */
button[kind="secondary"] {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border) !important;
    box-shadow: none !important;
}

/* ── Inputs ── */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea,
.stSelectbox > div > div > div,
.stNumberInput > div > div > input {
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-sm) !important;
    color: var(--text-primary) !important;
    font-size: 14px !important;
}

.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
}

/* Labels */
.stTextInput label, .stTextArea label, .stSelectbox label,
.stNumberInput label, .stCheckbox label, .stRadio label {
    color: var(--text-secondary) !important;
    font-size: 13px !important;
    font-weight: 500 !important;
}

/* ── Dataframe / Tables ── */
[data-testid="stDataFrame"] {
    border: 1px solid var(--border) !important;
    border-radius: var(--radius) !important;
    overflow: hidden !important;
}

.dataframe {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
}

/* ── Expander ── */
[data-testid="stExpander"] {
    background: var(--bg-card) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius) !important;
    margin-bottom: 8px !important;
}

[data-testid="stExpander"] summary {
    color: var(--text-primary) !important;
    font-weight: 500 !important;
    font-size: 14px !important;
}

/* ── Tabs ── */
[data-testid="stTabs"] [data-baseweb="tab-list"] {
    background: transparent !important;
    border-bottom: 1px solid var(--border) !important;
    gap: 4px !important;
}

[data-testid="stTabs"] [data-baseweb="tab"] {
    background: transparent !important;
    color: var(--text-muted) !important;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0 !important;
    font-size: 13.5px !important;
    font-weight: 500 !important;
    padding: 8px 16px !important;
    border: none !important;
    transition: color 0.15s !important;
}

[data-testid="stTabs"] [aria-selected="true"] {
    color: var(--accent) !important;
    border-bottom: 2px solid var(--accent) !important;
    background: var(--accent-light) !important;
}

/* ── Divider ── */
hr {
    border-color: var(--border) !important;
    margin: 16px 0 !important;
}

/* ── Badge styles ── */
.badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
}
.badge-new { background: rgba(99,102,241,0.15); color: #818cf8; }
.badge-approved { background: rgba(16,185,129,0.15); color: #34d399; }
.badge-contacted { background: rgba(59,130,246,0.15); color: #60a5fa; }
.badge-interested { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge-replied { background: rgba(139,92,246,0.15); color: #a78bfa; }
.badge-reviewed { background: rgba(100,116,139,0.15); color: #94a3b8; }
.badge-not-relevant { background: rgba(239,68,68,0.1); color: #f87171; }
.badge-dnc { background: rgba(239,68,68,0.2); color: #ef4444; }
.badge-call-booked { background: rgba(16,185,129,0.25); color: #10b981; }

/* ── Score bar ── */
.score-bar {
    height: 6px;
    border-radius: 3px;
    background: var(--bg-secondary);
    overflow: hidden;
    margin-top: 4px;
}
.score-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
}

/* ── Card component ── */
.sdr-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 12px;
    transition: border-color 0.2s, box-shadow 0.2s;
}
.sdr-card:hover {
    border-color: rgba(99,102,241,0.3);
    box-shadow: 0 4px 20px rgba(99,102,241,0.08);
}

/* ── Activity item ── */
.activity-item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    align-items: flex-start;
}
.activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    margin-top: 5px;
    flex-shrink: 0;
}

/* ── Toggle ── */
.stCheckbox > label {
    color: var(--text-secondary) !important;
}

/* ── Select box ── */
[data-baseweb="select"] {
    background: var(--bg-card) !important;
}

[data-baseweb="select"] > div {
    background: var(--bg-card) !important;
    border-color: var(--border) !important;
    color: var(--text-primary) !important;
}

/* ── Info boxes ── */
.stInfo {
    background: rgba(59,130,246,0.1) !important;
    border-color: rgba(59,130,246,0.3) !important;
    border-radius: var(--radius-sm) !important;
    color: var(--text-primary) !important;
}

.stSuccess {
    background: var(--success-light) !important;
    border-color: rgba(16,185,129,0.3) !important;
    border-radius: var(--radius-sm) !important;
}

.stWarning {
    background: var(--warning-light) !important;
    border-color: rgba(245,158,11,0.3) !important;
    border-radius: var(--radius-sm) !important;
}

.stError {
    background: var(--danger-light) !important;
    border-color: rgba(239,68,68,0.3) !important;
    border-radius: var(--radius-sm) !important;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

/* ── Page header component ── */
.page-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
}
.page-header h1 { margin-bottom: 2px !important; }
.page-subtitle {
    color: var(--text-muted);
    font-size: 13.5px;
    margin-top: 2px;
}

/* ── Stat pill ── */
.stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-right: 8px;
}

/* ── Status dot ── */
.status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 6px;
}
.dot-green { background: #10b981; box-shadow: 0 0 6px #10b981; }
.dot-red { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
.dot-yellow { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-blue { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
.dot-purple { background: #8b5cf6; box-shadow: 0 0 6px #8b5cf6; }

/* ── Hide Streamlit branding ── */
#MainMenu, footer, header { visibility: hidden !important; }
[data-testid="stToolbar"] { display: none !important; }
.viewerBadge_container__1QSob { display: none !important; }
</style>
""", unsafe_allow_html=True)


STATUS_COLORS = {
    "New": "#6366f1",
    "Reviewed": "#94a3b8",
    "Approved": "#10b981",
    "Contacted": "#3b82f6",
    "Replied": "#8b5cf6",
    "Interested": "#f59e0b",
    "Call Booked": "#10b981",
    "Not Relevant": "#ef4444",
    "Do Not Contact": "#ef4444",
}

NICHE_EMOJIS = {
    "wedding_video": "🎬",
    "photography": "📷",
    "studio": "🎙️",
    "content_creator": "✨",
    "other": "🎨",
}

CHANNEL_ICONS = {"email": "✉️", "dm": "💬", "comment": "💭"}
TONE_ICONS = {"soft": "🌿", "direct": "⚡", "professional": "👔"}

FLAG_MAP = {
    "en": "🇬🇧", "it": "🇮🇹", "fr": "🇫🇷", "de": "🇩🇪",
    "es": "🇪🇸", "pt": "🇵🇹", "nl": "🇳🇱",
}


def score_color(score: int) -> str:
    if score >= 75:
        return "#10b981"
    elif score >= 50:
        return "#f59e0b"
    return "#ef4444"


def status_badge(status: str) -> str:
    color = STATUS_COLORS.get(status, "#94a3b8")
    return f'<span style="background:rgba({_hex_to_rgb(color)},0.15);color:{color};padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.3px">{status}</span>'


def _hex_to_rgb(hex_color: str) -> str:
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return f"{r},{g},{b}"
