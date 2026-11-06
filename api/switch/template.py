import os
import sys
from pathlib import Path

CUR_DIR = Path(__file__).resolve().parent
API_DIR = CUR_DIR.parent
ROOT_DIR = API_DIR.parent
for p in [str(ROOT_DIR), str(API_DIR), str(CUR_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

os.environ.setdefault("DB_PATH", "/tmp/revenue_desk.db")

from src.database import init_database
init_database()

try:
    from api.index import handler
except ImportError:
    from index import handler
