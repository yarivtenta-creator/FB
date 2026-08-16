# Archive catalog

Layout of `asgeirtj/system_prompts_leaks` as of the July 2026 snapshot. Directory
names are stable; individual filenames churn as new model versions land, so treat
this as a map rather than an index — confirm with `ls` after syncing.

## Naming conventions

| Suffix | Meaning |
| --- | --- |
| *(none)* | the default consumer surface (web/app) prompt |
| `-api` | the prompt served on the API rather than the consumer product |
| `-no-tools` | same model, captured with no tool definitions attached |
| `-raw` | unprocessed capture, including delimiters and injected reminders |
| `-thinking`, `-instant`, `-pro` | reasoning-effort or tier variants |
| personality names (`-sol`, `-nerdy`, `-robot`, `-listener`) | selectable persona variants |

`Anthropic/old/` holds superseded captures; `Anthropic/Official/` holds prompts the
vendor published itself (higher confidence than extracted ones).

## Anthropic

- `Anthropic/*.md` — Claude Opus 4.6/4.7/4.8/5, Sonnet 4.6/5, Fable 5, plus surface
  variants: `claude-design`, `claude-cowork`, `claude-science`, `claude-in-chrome`,
  `claude-mobile-ios`, `claude-voice-mode`, `claude-for-excel|word|powerpoint`,
  `anthropic-interviewer`, `visualize`, `research_instructions`
- `Anthropic/anthropic_reminders.md`, `sonnet-4.6-reminders.md` — injected
  system-reminder text, not the base prompt
- `Anthropic/Official/all.md` — vendor-published prompts (~432 KB)
- `Anthropic/raw/` — unprocessed captures
- `Anthropic/Claude Code/` — CLI prompts per model, plus subdirectories:
  `agents/`, `skills/`, `slash-commands/`, `mcp-servers/`, `injected-reminders/`,
  and `bundled-skills/` (the skills compiled into the binary: `claude-api`,
  `claude-code-docs`, `code-review`, `dataviz`, `deep-research`, `design-sync`,
  `artifacts`, `run-skill-generator`)
- `Anthropic/Claude Design/` — `Skills/`, `Starter components/`

## OpenAI

- `OpenAI/*.md` — GPT-4o through GPT-5.6, including `-thinking`, `-instant`, `-api`,
  `-pro-api` tiers and personality variants; `chatgpt-atlas`, `chatgpt-gpt-5-agent-mode`,
  voice-mode prompts, `chatgpt-personality-instructions`
- `OpenAI/tool-*.md` — individual tool prompts (advanced memory, deep research)
- `OpenAI/Codex/` — Codex CLI prompts including `gpt-5.6.md`, `gpt-5.6-sol.md`,
  `codex-full.md` (~352 KB)

## Google

`Google/` — Gemini 2.0 through 3.5 (webapp, API, Flash, Pro), `gemini-cli`,
`antigravity-cli`, `jules`, `ai-studio-build`, `google-search-ai-mode`,
`notebooklm-chat`, `gemini-in-chrome`, `gemini-workspace`, `gemini-youtube`,
`nano-banana-2-api`, `gemini-diffusion`

## xAI

`xAI/` — Grok 3 through 4.5, plus `grok-api`, `grok-build`, `grok-expert`,
`grok-personas`, `grok-account`, and a safety-instructions variant

## Coding tools

- `Cursor/cursor.md`
- `Microsoft/` — `github-copilot`, `vscode-copilot-agent`, `copilot-cli`,
  `copilot-macos-app`, `copilot-in-microsoft-word`
- `OpenCode/opencode.md`
- `Misc/` — `devin-cli`, `amp-code`, `commandcode-cli`, and others

## Other vendors

`Perplexity/` (search, deep research, Comet browser, voice), `DeepSeek/`, `GLM/`,
`Kimi/`, `Qwen/`, `Meta/`, `Mistral/`, `Notion/`, `Pi/`, and `Misc/` — a long tail
covering browser assistants, voice agents, search products, and app builders.

## Search recipes

```bash
ls "$SPL_DIR"                                    # vendors
ls "$SPL_DIR/Anthropic"                          # files for one vendor
find "$SPL_DIR" -name '*grok*'                   # locate by product name
```

Then Grep for wording across the whole archive — cheaper and more reliable than
reading files whole, several of which exceed 200 KB.
