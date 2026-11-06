import os
import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# On Vercel serverless environments, redirect SQLite database to writable /tmp
os.environ.setdefault("DB_PATH", "/tmp/revenue_desk.db")

from app import SwitchAppHandler

class handler(SwitchAppHandler):
    """Vercel Serverless Function entry point inheriting from SwitchAppHandler."""
    pass
