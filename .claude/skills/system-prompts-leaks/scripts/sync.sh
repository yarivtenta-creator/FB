#!/usr/bin/env bash
# Sync the system_prompts_leaks archive into a local cache and report its state.
# Usage: sync.sh            # clone or pull into the default cache dir
#        SPL_DIR=/tmp/spl sync.sh
set -euo pipefail

REPO_URL="https://github.com/asgeirtj/system_prompts_leaks.git"
SPL_DIR="${SPL_DIR:-${XDG_CACHE_HOME:-$HOME/.cache}/system-prompts-leaks}"

report() {
  local when
  when=$(git -C "$SPL_DIR" log -1 --format=%cd --date=short)
  echo "SPL_DIR=$SPL_DIR"
  echo "upstream commit date: $when"
  echo "files: $(git -C "$SPL_DIR" ls-files | wc -l | tr -d ' ')"
}

if [ -d "$SPL_DIR/.git" ]; then
  if git -C "$SPL_DIR" pull --ff-only --quiet 2>/dev/null; then
    echo "updated archive"
  else
    echo "WARNING: pull failed (offline or diverged) — using existing cache, contents may be stale" >&2
  fi
else
  mkdir -p "$(dirname "$SPL_DIR")"
  # Shallow: only current contents are needed, never the history.
  if ! git clone --depth 1 --quiet "$REPO_URL" "$SPL_DIR"; then
    echo "ERROR: clone failed and no cache exists at $SPL_DIR" >&2
    exit 1
  fi
  echo "cloned archive"
fi

report
