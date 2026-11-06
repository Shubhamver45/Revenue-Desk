import os
import sys
from pathlib import Path

# Ensure both project root and api directory are on sys.path
API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(API_DIR))

# On Vercel serverless environments, redirect SQLite database to writable /tmp
os.environ.setdefault("DB_PATH", "/tmp/revenue_desk.db")

from src.database import init_database

# Ensure database is seeded on lambda cold start
init_database()

try:
    from api.index import handler
except ImportError:
    from index import handler
