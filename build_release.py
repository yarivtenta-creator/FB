#!/usr/bin/env python3
"""
Release builder: creates a distributable ZIP package.
Run: python build_release.py
Output: dist/edit-value-sdr-mini-v1.0.0.zip
"""
import zipfile
import os
import shutil
from pathlib import Path
from datetime import datetime

VERSION = "1.0.0"
INCLUDE = [
    "app/", "config/", "docs/", "tests/", ".env.example",
    "requirements.txt", "install.bat", "install.sh",
    "run_local.bat", "run_local.sh", "README.md", "backup.bat", "backup.sh",
    "CUSTOMER_README.md",
]
EXCLUDE = ["__pycache__", ".pyc", "data/", ".env", ".git", "backups/", ".pyc"]


def build():
    dist = Path("dist")
    dist.mkdir(exist_ok=True)
    zip_name = f"edit-value-sdr-mini-v{VERSION}.zip"
    zip_path = dist / zip_name
    count = 0
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for pattern in INCLUDE:
            p = Path(pattern.rstrip("/"))
            if not p.exists():
                continue
            if p.is_dir():
                for f in p.rglob("*"):
                    if f.is_file() and not any(ex in str(f) for ex in EXCLUDE):
                        zf.write(f)
                        count += 1
            elif p.is_file():
                zf.write(p)
                count += 1
    print(f"Built {zip_path} ({count} files)")
    return str(zip_path)


if __name__ == "__main__":
    build()
