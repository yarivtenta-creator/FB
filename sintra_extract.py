# HOW TO USE:
# 1. Close all Chrome windows
# 2. Open Command Prompt and run:
#    "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome_debug_profile"
# 3. In that Chrome, navigate to your Notion page
# 4. Run: pip install playwright && python -m playwright install chromium
# 5. Run: python sintra_extract.py

import json
import csv
import os
import re
import time
import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeoutError
except ImportError:
    print("Playwright not found. Run: pip install playwright && python -m playwright install chromium")
    raise

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────
DELAY = 1.5          # seconds between tasks (increase if pages load slowly)
MAX_LOAD_MORE_CLICKS = 200
TASK_TIMEOUT = 15000  # ms to wait for selectors
OUTPUT_ROOT = Path(r"C:\Users\Local PC\Documents\SINTRA_CUSTOMER_SUPPORT_PROMPT_LIBRARY_EXTRACT")

FOLDERS = {
    "raw":      OUTPUT_ROOT / "01_RAW_EXPORTS",
    "screens":  OUTPUT_ROOT / "02_SCREENSHOTS",
    "data":     OUTPUT_ROOT / "03_EXTRACTED_DATA",
    "reports":  OUTPUT_ROOT / "04_REPORTS",
    "recovery": OUTPUT_ROOT / "05_RECOVERY_LOGS",
}

# Notion selectors (robust, class-agnostic where possible)
SEL_LOAD_MORE      = 'div[role="button"]:has-text("Load more"), button:has-text("Load more"), a:has-text("Load more"), span:has-text("Load more")'
SEL_PAGE_CONTENT   = '.notion-page-content, [data-content-editable-root="true"]'
SEL_DB_ROW         = '.notion-collection-item, [data-block-id] .notion-list-item, [role="row"]'
SEL_TITLE_CELL     = '.notion-collection-item-title, [placeholder="Untitled"], [data-content-editable-leaf="true"]'
SEL_SIDE_PANEL     = '.notion-peek-renderer, .notion-overlay-container, [data-overlay="true"]'
SEL_PROPERTY_ROW   = '.notion-page-property'
SEL_TEXT_BLOCK     = '[data-block-id] p, .notion-text-block .notranslate, [data-content-editable-leaf="true"]'
SEL_CLOSE_PANEL    = '[aria-label="Close"], button[aria-label="Close peek"]'

# ─────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────
LOG_PATH: Path = FOLDERS["recovery"] / "browser_actions_log.md"

def ts() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log(msg: str, also_print: bool = True):
    entry = f"- [{ts()}] {msg}\n"
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(entry)
    except Exception:
        pass
    if also_print:
        print(msg)

# ─────────────────────────────────────────────
# FOLDER / FILE SETUP
# ─────────────────────────────────────────────
def setup_folders():
    for folder in FOLDERS.values():
        folder.mkdir(parents=True, exist_ok=True)
    # Initialise log
    with open(LOG_PATH, "w", encoding="utf-8") as f:
        f.write(f"# Browser Actions Log\n\nStarted: {ts()}\n\n")
    log("Folder structure created.")

# ─────────────────────────────────────────────
# CHROME ATTACHMENT
# ─────────────────────────────────────────────
def attach_to_chrome(playwright):
    log("Connecting to Chrome on http://localhost:9222 ...")
    try:
        browser = playwright.chromium.connect_over_cdp("http://localhost:9222")
    except Exception as e:
        log(f"FAILED to connect: {e}")
        print("\n>>> Make sure Chrome is running with --remote-debugging-port=9222")
        print('>>> Command: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"'
              ' --remote-debugging-port=9222 --user-data-dir="C:\\chrome_debug_profile"')
        raise
    log("Connected to Chrome.")
    return browser

def find_notion_tab(browser):
    """Return the page (tab) that looks like the Notion Customer Support page."""
    keywords_url  = ["notion.so", "notion.site"]
    keywords_title = ["customer support", "sintra", "chatgpt prompts", "999"]

    all_pages = []
    for ctx in browser.contexts:
        all_pages.extend(ctx.pages)

    log(f"Found {len(all_pages)} open tab(s).")

    # First pass: title + URL match
    for page in all_pages:
        title = (page.title() or "").lower()
        url   = (page.url or "").lower()
        url_match   = any(k in url   for k in keywords_url)
        title_match = any(k in title for k in keywords_title)
        if url_match and title_match:
            log(f"Found matching tab: '{page.title()}' — {page.url}")
            return page

    # Second pass: just notion URL
    for page in all_pages:
        url = (page.url or "").lower()
        if any(k in url for k in keywords_url):
            log(f"Found Notion tab (title didn't match): '{page.title()}' — {page.url}")
            return page

    # Give up — list tabs
    print("\n>>> Could not find the Notion Customer Support tab automatically.")
    print(">>> Open tabs found:")
    for i, page in enumerate(all_pages):
        print(f"    [{i}] {page.title()!r:60s}  {page.url}")
    print("\n>>> Please navigate to the Notion page in Chrome, then press Enter.")
    input(">>> Press Enter when ready: ")

    # Re-scan
    all_pages2 = []
    for ctx in browser.contexts:
        all_pages2.extend(ctx.pages)
    for page in all_pages2:
        url = (page.url or "").lower()
        if any(k in url for k in keywords_url):
            log(f"Using Notion tab after user prompt: '{page.title()}' — {page.url}")
            return page

    raise RuntimeError("No Notion tab found even after user prompt.")

# ─────────────────────────────────────────────
# SCROLL HELPERS
# ─────────────────────────────────────────────
def slow_scroll_to_bottom(page, selector: str = None, steps: int = 20, delay_ms: int = 300):
    """Scroll element (or window) to bottom gradually to trigger lazy loads."""
    try:
        if selector:
            page.eval_on_selector(selector, f"""
                el => {{
                    const step = el.scrollHeight / {steps};
                    let pos = 0;
                    const go = () => {{
                        pos += step;
                        el.scrollTop = pos;
                        if (pos < el.scrollHeight) setTimeout(go, {delay_ms});
                    }};
                    go();
                }}
            """)
        else:
            page.evaluate(f"""
                () => {{
                    const step = document.body.scrollHeight / {steps};
                    let pos = 0;
                    const go = () => {{
                        pos += step;
                        window.scrollTo(0, pos);
                        if (pos < document.body.scrollHeight) setTimeout(go, {delay_ms});
                    }};
                    go();
                }}
            """)
        time.sleep((steps * delay_ms / 1000) + 0.5)
    except Exception as e:
        log(f"Scroll error (non-fatal): {e}", also_print=False)

# ─────────────────────────────────────────────
# LOAD MORE UNTIL EXHAUSTED
# ─────────────────────────────────────────────
def expand_all_rows(page):
    log("Expanding all rows — clicking 'Load more' until exhausted ...")
    clicked = 0
    for _ in range(MAX_LOAD_MORE_CLICKS):
        slow_scroll_to_bottom(page)
        try:
            btn = page.locator(SEL_LOAD_MORE).first
            if btn.is_visible(timeout=3000):
                btn.click()
                clicked += 1
                log(f"  Clicked 'Load more' #{clicked}", also_print=False)
                time.sleep(1.5)
            else:
                break
        except PWTimeoutError:
            break
        except Exception:
            break
    log(f"Load more exhausted after {clicked} click(s).")

# ─────────────────────────────────────────────
# COLLECT MASTER INDEX
# ─────────────────────────────────────────────
def collect_master_index(page) -> list:
    log("Collecting master index of all tasks ...")

    # Dump DOM snapshot for debugging
    dom_snippet = page.evaluate("() => document.body.innerHTML.slice(0, 3000)")
    log(f"DOM snippet (first 500 chars): {dom_snippet[:500]}", also_print=False)

    rows_js = page.evaluate("""
        () => {
            const results = [];
            const seen = new Set();

            const add = (title, block_id, href) => {
                const key = title.toLowerCase().trim();
                if (!key || key.length < 3 || seen.has(key)) return;
                seen.add(key);
                results.push({ title: title.trim(), block_id: block_id || '', href: href || '' });
            };

            // S1: notion-collection-item (app view)
            document.querySelectorAll('.notion-collection-item').forEach(el => {
                const t = el.querySelector('.notion-collection-item-title');
                const id = el.getAttribute('data-block-id') || '';
                if (t) add(t.innerText, id, '');
            });

            // S2: table rows role="row"
            if (results.length === 0) {
                document.querySelectorAll('[role="row"]').forEach(el => {
                    const cell = el.querySelector('[role="cell"]');
                    const id = el.getAttribute('data-block-id') || '';
                    const t = cell ? cell.innerText.trim() : '';
                    if (t && t !== 'Name' && t !== 'Title') add(t, id, '');
                });
            }

            // S3: any anchor whose href is a notion page link (public site)
            if (results.length === 0) {
                document.querySelectorAll('a[href]').forEach(el => {
                    const href = el.href || '';
                    if (!href.includes('notion') && !href.includes('sintra')) return;
                    // skip nav/header links (short text)
                    const t = el.innerText.replace(/\\n/g, ' ').trim();
                    if (t.length < 4) return;
                    add(t, '', href);
                });
            }

            // S4: list items inside a notion page (public rendered page)
            if (results.length === 0) {
                // Public Notion pages render as divs with class containing "notion"
                const listItems = document.querySelectorAll(
                    '[class*="notion"][class*="list"] a, ' +
                    '[class*="collection"] a, ' +
                    '[class*="gallery"] a, ' +
                    'li a, ' +
                    'td a'
                );
                listItems.forEach(el => {
                    const t = el.innerText.replace(/\\n/g, ' ').trim();
                    add(t, '', el.href || '');
                });
            }

            // S5: broadest fallback — every unique non-trivial link on page
            if (results.length === 0) {
                document.querySelectorAll('a').forEach(el => {
                    const href = el.href || '';
                    const t = el.innerText.replace(/\\n/g, ' ').trim();
                    if (t.length > 5 && href.length > 10) add(t, '', href);
                });
            }

            // Number them
            results.forEach((r, i) => { r.index = i; });
            return results;
        }
    """)

    log(f"Master index: found {len(rows_js)} items via JS.")

    # If still 0, dump all links so we can debug
    if len(rows_js) == 0:
        all_links = page.evaluate("""
            () => [...document.querySelectorAll('a')].slice(0,50).map(a => ({
                text: a.innerText.trim().slice(0,80),
                href: a.href.slice(0,120)
            }))
        """)
        log(f"DEBUG all links on page: {json.dumps(all_links, ensure_ascii=False)}", also_print=True)

    for item in rows_js:
        item["status"] = "pending"
        item.setdefault("task_url", "")

    return rows_js

# ─────────────────────────────────────────────
# EXTRACT SINGLE TASK
# ─────────────────────────────────────────────
def extract_task_content(page, task: dict) -> dict:
    """Extract all fields from the currently-open task page/side-panel."""
    result = {
        "task_title": task.get("title", ""),
        "block_id": task.get("block_id", ""),
        "category": "",
        "tags": [],
        "about_text": "",
        "prompt_1": "",
        "prompt_2": "",
        "prompt_3": "",
        "all_prompts_combined": "",
        "examples": "",
        "tips": "",
        "warnings_notes": "",
        "task_url": page.url,
        "source_status": "pending",
        "extraction_timestamp": ts(),
        "raw_text": "",
    }

    # Wait for content
    try:
        page.wait_for_selector(SEL_PAGE_CONTENT, timeout=TASK_TIMEOUT)
    except PWTimeoutError:
        pass

    # Scroll panel to load lazy content
    for panel_sel in [
        ".notion-peek-renderer",
        ".notion-overlay-container",
        ".notion-scroller.vertical",
        ".notion-frame",
    ]:
        try:
            if page.locator(panel_sel).first.is_visible(timeout=1000):
                slow_scroll_to_bottom(page, selector=panel_sel, steps=15, delay_ms=200)
                break
        except Exception:
            pass
    else:
        slow_scroll_to_bottom(page, steps=10, delay_ms=200)

    time.sleep(0.8)

    # Extract via JS for reliability
    extracted = page.evaluate("""
        () => {
            const getText = sel => {
                const el = document.querySelector(sel);
                return el ? el.innerText.trim() : '';
            };
            const getAll = sel => [...document.querySelectorAll(sel)].map(e => e.innerText.trim()).filter(Boolean);

            // Title
            const titleSelectors = [
                '.notion-page-block .notranslate',
                'h1.notion-header-block .notranslate',
                '[data-content-editable-leaf] h1',
                'h1',
            ];
            let title = '';
            for (const sel of titleSelectors) {
                title = getText(sel);
                if (title) break;
            }

            // Properties (category, tags)
            const props = {};
            const propRows = document.querySelectorAll('.notion-page-property');
            propRows.forEach(row => {
                const label = row.querySelector('.notion-page-property-label');
                const value = row.querySelector('.notion-page-property-value, .notion-property');
                if (label && value) {
                    const key = label.innerText.trim().toLowerCase();
                    props[key] = value.innerText.trim();
                }
            });

            // Also grab select/multi-select chips
            const tags = getAll('.notion-selectable-hanger .notranslate, .notion-property-select-value .notranslate, [class*="selectValue"] span');

            // All text blocks in order
            const textBlocks = getAll(
                '[data-block-id] .notion-text-block .notranslate, ' +
                '[data-block-id] p .notranslate, ' +
                '.notion-page-content [data-content-editable-leaf="true"]'
            );

            // Numbered list items
            const numberedItems = getAll(
                '.notion-numbered_list-block .notranslate, ' +
                '.notion-bulleted_list-block .notranslate, ' +
                'ol li .notranslate, ul li .notranslate'
            );

            // Section detection
            const allText = document.querySelector('.notion-page-content, .notion-peek-renderer');
            const fullText = allText ? allText.innerText : document.body.innerText;

            // Extract sections by heading keywords
            const sectionPattern = (keyword) => {
                const re = new RegExp(keyword + '[:\\s]*([\\s\\S]*?)(?=\\n[A-Z][^\\n]{0,50}\\n|$)', 'i');
                const m = fullText.match(re);
                return m ? m[1].trim().slice(0, 2000) : '';
            };

            return {
                title_found: title,
                props,
                tags,
                text_blocks: textBlocks.slice(0, 50),
                numbered_items: numberedItems.slice(0, 30),
                full_text: fullText.slice(0, 8000),
                about_section: sectionPattern('about'),
                examples_section: sectionPattern('example'),
                tips_section: sectionPattern('tip'),
                warnings_section: sectionPattern('warn|note|caution'),
            };
        }
    """)

    if extracted.get("title_found"):
        result["task_title"] = extracted["title_found"]

    # Category / tags
    props = extracted.get("props", {})
    result["category"] = (
        props.get("category", "") or
        props.get("type", "") or
        props.get("tag", "") or
        props.get("labels", "") or
        ""
    )
    result["tags"] = extracted.get("tags", [])
    if not result["category"] and result["tags"]:
        result["category"] = result["tags"][0]

    # About
    result["about_text"] = extracted.get("about_section", "")
    if not result["about_text"]:
        blocks = extracted.get("text_blocks", [])
        result["about_text"] = blocks[0] if blocks else ""

    # Prompts — numbered items first, then text blocks
    prompt_candidates = extracted.get("numbered_items", []) or extracted.get("text_blocks", [])
    # Filter likely prompts (longer strings, imperative)
    prompts = [p for p in prompt_candidates if len(p) > 20][:10]
    result["prompt_1"] = prompts[0] if len(prompts) > 0 else ""
    result["prompt_2"] = prompts[1] if len(prompts) > 1 else ""
    result["prompt_3"] = prompts[2] if len(prompts) > 2 else ""
    result["all_prompts_combined"] = "\n\n".join(prompts)

    # Examples / Tips / Warnings
    result["examples"]       = extracted.get("examples_section", "")
    result["tips"]           = extracted.get("tips_section", "")
    result["warnings_notes"] = extracted.get("warnings_section", "")

    # Raw snapshot
    result["raw_text"]    = extracted.get("full_text", "")
    result["task_url"]    = page.url
    result["source_status"] = "extracted" if result["task_title"] else "partial"

    return result

# ─────────────────────────────────────────────
# OPEN A TASK
# ─────────────────────────────────────────────
def open_task(page, task: dict) -> bool:
    """Click a task row to open it. Returns True on success."""
    block_id  = task.get("block_id", "")
    title_txt = task.get("title", "")
    href      = task.get("href", "")

    if href:
        try:
            page.goto(href, wait_until="domcontentloaded", timeout=20000)
            time.sleep(1)
            return True
        except Exception:
            pass

    # Try block-id selector
    if block_id:
        selectors = [
            f'[data-block-id="{block_id}"] .notion-collection-item-title',
            f'[data-block-id="{block_id}"]',
            f'a[href*="{block_id.replace("-","")}"]',
        ]
        for sel in selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=2000):
                    loc.click()
                    time.sleep(1.5)
                    return True
            except Exception:
                pass

    # Fallback: text match
    if title_txt:
        # Escape special CSS chars
        safe = re.sub(r'[^\w\s-]', '', title_txt)[:40]
        try:
            loc = page.get_by_text(safe, exact=False).first
            if loc.is_visible(timeout=3000):
                loc.click()
                time.sleep(1.5)
                return True
        except Exception:
            pass

    return False

def close_task_panel(page):
    """Try to close side panel or navigate back."""
    # Try close button
    for sel in [
        '[aria-label="Close"]',
        'button[aria-label="Close peek"]',
        '.notion-peek-renderer [aria-label="Close"]',
        '[data-tooltip="Close"]',
    ]:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=1000):
                btn.click()
                time.sleep(0.8)
                return
        except Exception:
            pass
    # Fallback: press Escape
    try:
        page.keyboard.press("Escape")
        time.sleep(0.8)
    except Exception:
        pass

# ─────────────────────────────────────────────
# MAIN EXTRACTION LOOP
# ─────────────────────────────────────────────
def run_extraction(page, master_index: list[dict]) -> list[dict]:
    results = []
    failed  = []
    total   = len(master_index)

    for i, task in enumerate(master_index):
        if task.get("status") == "extracted":
            log(f"Skipping already-extracted: {task['title']}", also_print=False)
            results.append(task)
            continue

        title = task.get("title", f"task_{i}")
        print(f"\nTask {i+1}/{total}: {title[:80]}")
        log(f"Processing task {i+1}/{total}: {title}", also_print=False)

        raw_path = FOLDERS["raw"] / f"task_{i:04d}.txt"

        try:
            opened = open_task(page, task)
            if not opened:
                raise RuntimeError("Could not open task — no clickable element found.")

            data = extract_task_content(page, task)
            data["index"] = i

            # Save raw snapshot
            with open(raw_path, "w", encoding="utf-8") as f:
                f.write(f"=== Task {i} ===\n")
                f.write(f"Title: {data['task_title']}\n")
                f.write(f"URL: {data['task_url']}\n")
                f.write(f"Extracted: {data['extraction_timestamp']}\n\n")
                f.write(data.get("raw_text", ""))

            task["status"] = data["source_status"]
            results.append(data)
            log(f"  OK [{data['source_status']}]: {data['task_title']}", also_print=False)

            if data["source_status"] == "failed":
                failed.append((i, task))

        except Exception as e:
            log(f"  FAILED task {i}: {title} — {e}")
            # Screenshot
            try:
                ss_path = FOLDERS["screens"] / f"failed_{i:04d}.png"
                page.screenshot(path=str(ss_path))
            except Exception:
                pass
            task["status"] = "failed"
            task["error"]  = str(e)
            failed.append((i, task))
            results.append({
                "index": i,
                "task_title": title,
                "block_id": task.get("block_id", ""),
                "category": "",
                "tags": [],
                "about_text": "",
                "prompt_1": "",
                "prompt_2": "",
                "prompt_3": "",
                "all_prompts_combined": "",
                "examples": "",
                "tips": "",
                "warnings_notes": "",
                "task_url": "",
                "source_status": "failed",
                "extraction_timestamp": ts(),
                "raw_text": "",
                "error": str(e),
            })

        finally:
            close_task_panel(page)
            time.sleep(DELAY)

    return results, failed

# ─────────────────────────────────────────────
# RETRY FAILED
# ─────────────────────────────────────────────
def retry_failed(page, results: list[dict], failed: list) -> list[dict]:
    if not failed:
        log("No failed tasks to retry.")
        return results

    log(f"Retrying {len(failed)} failed task(s) ...")
    for orig_i, task in failed:
        title = task.get("title", f"task_{orig_i}")
        print(f"\n[RETRY] Task {orig_i}: {title[:80]}")
        log(f"Retrying task {orig_i}: {title}", also_print=False)
        try:
            opened = open_task(page, task)
            if not opened:
                raise RuntimeError("Could not open task on retry.")
            data = extract_task_content(page, task)
            data["index"] = orig_i
            # Replace in results
            for j, r in enumerate(results):
                if r.get("index") == orig_i:
                    results[j] = data
                    break
            log(f"  RETRY OK [{data['source_status']}]: {data['task_title']}", also_print=False)
        except Exception as e:
            log(f"  RETRY FAILED task {orig_i}: {e}")
        finally:
            close_task_panel(page)
            time.sleep(DELAY)
    return results

# ─────────────────────────────────────────────
# SAVE OUTPUTS
# ─────────────────────────────────────────────
CSV_FIELDS = [
    "index", "task_title", "category", "tags",
    "about_text", "prompt_1", "prompt_2", "prompt_3",
    "all_prompts_combined", "examples", "tips", "warnings_notes",
    "task_url", "source_status", "extraction_timestamp",
]

def save_outputs(results: list[dict], master_index: list[dict]):
    data_dir    = FOLDERS["data"]
    reports_dir = FOLDERS["reports"]

    # ── 1. JSON ──────────────────────────────
    json_path = data_dir / "sintra_support_prompts_full.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    log(f"Saved JSON: {json_path}")

    # ── 2. CSV ───────────────────────────────
    csv_path = data_dir / "sintra_support_prompts_full.csv"
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for r in results:
            row = dict(r)
            row["tags"] = ", ".join(r.get("tags", []))
            writer.writerow(row)
    log(f"Saved CSV: {csv_path}")

    # ── 3. Markdown ──────────────────────────
    md_path = data_dir / "sintra_support_prompts_full.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Sintra Customer Support Prompt Library\n\n")
        f.write(f"*Extracted: {ts()}*\n\n---\n\n")
        for r in results:
            f.write(f"## {r.get('task_title', 'Untitled')}\n\n")
            f.write(f"**Category:** {r.get('category', '')}\n\n")
            if r.get("about_text"):
                f.write(f"**About:**\n{r['about_text']}\n\n")
            for pi in range(1, 4):
                p = r.get(f"prompt_{pi}", "")
                if p:
                    f.write(f"**Prompt {pi}:**\n{p}\n\n")
            if r.get("examples"):
                f.write(f"**Examples:**\n{r['examples']}\n\n")
            if r.get("tips"):
                f.write(f"**Tips:**\n{r['tips']}\n\n")
            if r.get("warnings_notes"):
                f.write(f"**Notes/Warnings:**\n{r['warnings_notes']}\n\n")
            f.write(f"*Status: {r.get('source_status')} | URL: {r.get('task_url', '')}*\n\n---\n\n")
    log(f"Saved Markdown: {md_path}")

    # ── 4. Category counts ───────────────────
    from collections import defaultdict
    cat_map = defaultdict(list)
    for r in results:
        cat = r.get("category") or "Uncategorised"
        cat_map[cat].append(r.get("task_title", ""))

    cat_csv = data_dir / "sintra_support_subjects_by_category.csv"
    with open(cat_csv, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["category", "count", "task_titles"])
        for cat, titles in sorted(cat_map.items(), key=lambda x: -len(x[1])):
            writer.writerow([cat, len(titles), " | ".join(titles)])
    log(f"Saved category CSV: {cat_csv}")

    # ── 5. Missing / failed ──────────────────
    failed_items = [r for r in results if r.get("source_status") == "failed"]
    partial_items = [r for r in results if r.get("source_status") == "partial"]

    missing_csv = data_dir / "missing_or_failed_items.csv"
    with open(missing_csv, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["index", "task_title", "status", "reason"])
        for r in failed_items + partial_items:
            writer.writerow([
                r.get("index", ""),
                r.get("task_title", ""),
                r.get("source_status", ""),
                r.get("error", ""),
            ])
    log(f"Saved missing/failed CSV: {missing_csv}")

    # ── QA checks ────────────────────────────
    total          = len(results)
    extracted_ok   = sum(1 for r in results if r.get("source_status") == "extracted")
    partial_count  = sum(1 for r in results if r.get("source_status") == "partial")
    failed_count   = sum(1 for r in results if r.get("source_status") == "failed")
    no_title       = [r for r in results if not r.get("task_title")]
    no_category    = [r for r in results if not r.get("category")]
    no_prompts     = [r for r in results if not r.get("prompt_1")]
    titles         = [r.get("task_title", "") for r in results]
    dup_titles     = [t for t in set(titles) if titles.count(t) > 1 and t]

    qa_pass  = extracted_ok == total
    qa_label = "PASS" if qa_pass else ("PARTIAL" if extracted_ok > 0 else "FAIL")

    # ── 6. EXTRACTION_REPORT.md ──────────────
    report = reports_dir / "EXTRACTION_REPORT.md"
    with open(report, "w", encoding="utf-8") as f:
        f.write("# Extraction Report\n\n")
        f.write(f"**Generated:** {ts()}\n\n")
        f.write("## Summary\n\n")
        f.write(f"| Metric | Value |\n|---|---|\n")
        f.write(f"| Total rows found | {total} |\n")
        f.write(f"| Extracted (full) | {extracted_ok} |\n")
        f.write(f"| Partial | {partial_count} |\n")
        f.write(f"| Failed | {failed_count} |\n")
        f.write(f"| Categories | {len(cat_map)} |\n")
        f.write(f"| Duplicate titles | {len(dup_titles)} |\n\n")
        f.write("## Method\n\nPlaywright CDP connection to existing Chrome session.\n")
        f.write("Notion DOM scraped via JavaScript evaluation.\n\n")
        f.write("## Limitations\n\n- Notion lazy-loading may miss some content.\n")
        f.write("- Dynamic class names required JS-based extraction.\n")
        f.write("- Side panel vs full-page differences may affect field completeness.\n\n")
        f.write("## Next Steps\n\n- Review `missing_or_failed_items.csv` and re-run for failed items.\n")
        f.write("- Check `partial` items for missing prompt fields.\n")
        f.write("- Cross-reference total against Notion row count in UI.\n")
    log(f"Saved report: {report}")

    # ── 7. CATEGORY_COUNTS.md ────────────────
    cat_report = reports_dir / "CATEGORY_COUNTS.md"
    with open(cat_report, "w", encoding="utf-8") as f:
        f.write("# Category Counts\n\n")
        f.write(f"| Category | Count |\n|---|---|\n")
        for cat, titles_list in sorted(cat_map.items(), key=lambda x: -len(x[1])):
            f.write(f"| {cat} | {len(titles_list)} |\n")
    log(f"Saved: {cat_report}")

    # ── 8. QA_CHECKLIST.md ───────────────────
    qa_path = reports_dir / "QA_CHECKLIST.md"
    with open(qa_path, "w", encoding="utf-8") as f:
        f.write("# QA Checklist\n\n")
        f.write(f"**Overall Verdict: {qa_label}**\n\n")
        items = [
            ("All rows extracted",       "PASS" if failed_count == 0 else "FAIL",   f"{failed_count} failed"),
            ("No partial extractions",   "PASS" if partial_count == 0 else "PARTIAL", f"{partial_count} partial"),
            ("All tasks have titles",    "PASS" if not no_title else "FAIL",          f"{len(no_title)} missing"),
            ("All tasks have category",  "PASS" if not no_category else "PARTIAL",   f"{len(no_category)} missing"),
            ("All tasks have prompts",   "PASS" if not no_prompts else "PARTIAL",    f"{len(no_prompts)} missing"),
            ("No duplicate titles",      "PASS" if not dup_titles else "PARTIAL",    f"{len(dup_titles)} dups: {dup_titles[:3]}"),
        ]
        f.write("| Check | Status | Notes |\n|---|---|---|\n")
        for check, status, note in items:
            f.write(f"| {check} | {status} | {note} |\n")
    log(f"Saved QA checklist: {qa_path}")

    return {
        "total": total,
        "extracted": extracted_ok,
        "partial": partial_count,
        "failed": failed_count,
        "qa_label": qa_label,
    }

# ─────────────────────────────────────────────
# MASTER INDEX PERSISTENCE
# ─────────────────────────────────────────────
MASTER_INDEX_PATH = FOLDERS["data"] / "master_index.json" if False else None  # set after folders

def load_master_index() -> list[dict] | None:
    path = FOLDERS["data"] / "master_index.json"
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            log(f"Loaded existing master_index.json ({len(data)} items) — resuming.")
            return data
        except Exception:
            pass
    return None

def save_master_index(index: list[dict]):
    path = FOLDERS["data"] / "master_index.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    log(f"Saved master_index.json ({len(index)} items).")

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  Sintra Customer Support Prompt Library Extractor")
    print("=" * 60)
    print()
    print("PREREQUISITES:")
    print('  1. Close all Chrome windows.')
    print('  2. Run in CMD:')
    print('     "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"'
          ' --remote-debugging-port=9222 --user-data-dir="C:\\chrome_debug_profile"')
    print('  3. Navigate Chrome to your Notion Customer Support page.')
    print('  4. Then press Enter here to begin.')
    print()
    input(">>> Press Enter when Chrome is ready: ")

    setup_folders()
    log("Script started.")

    with sync_playwright() as pw:
        browser = attach_to_chrome(pw)
        page    = find_notion_tab(browser)
        page.bring_to_front()
        time.sleep(1)

        # Load or build master index
        master_index = load_master_index()
        if master_index is None:
            expand_all_rows(page)
            master_index = collect_master_index(page)
            if not master_index:
                log("ERROR: Could not find any tasks. Is the Notion page fully loaded?")
                print("\nERROR: No tasks found. Make sure you are on the Notion database page.")
                return
            save_master_index(master_index)
        else:
            # Filter to only pending items for this run
            pending = [t for t in master_index if t.get("status") in ("pending", "failed", None)]
            log(f"Resume mode: {len(pending)} tasks still pending / failed out of {len(master_index)}.")

        log(f"Total tasks to process: {len(master_index)}")
        print(f"\nFound {len(master_index)} tasks. Starting extraction...\n")

        results, failed = run_extraction(page, master_index)

        # Retry failed
        if failed:
            print(f"\nRetrying {len(failed)} failed task(s)...")
            results = retry_failed(page, results, failed)

        # Update master index statuses
        status_map = {r.get("index"): r.get("source_status") for r in results}
        for task in master_index:
            idx = task.get("index", None)
            # find by position
            for j, t in enumerate(master_index):
                if t is task:
                    if j < len(results):
                        task["status"] = results[j].get("source_status", task["status"])
                    break
        save_master_index(master_index)

        # Save all outputs
        summary = save_outputs(results, master_index)

        log("Extraction complete.")
        print("\n" + "=" * 60)
        print("  EXTRACTION COMPLETE")
        print("=" * 60)
        print(f"  Total tasks   : {summary['total']}")
        print(f"  Extracted     : {summary['extracted']}")
        print(f"  Partial       : {summary['partial']}")
        print(f"  Failed        : {summary['failed']}")
        print(f"  QA Verdict    : {summary['qa_label']}")
        print(f"\n  Output folder : {OUTPUT_ROOT}")
        print("=" * 60)

if __name__ == "__main__":
    main()
