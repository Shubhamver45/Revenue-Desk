import os
import sys
import urllib.parse
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# On Vercel serverless environments, redirect SQLite database to writable /tmp
os.environ.setdefault("DB_PATH", "/tmp/revenue_desk.db")

from app import SwitchAppHandler


class handler(SwitchAppHandler):
    """Vercel Serverless Function entry point inheriting from SwitchAppHandler."""

    def get_request_path(self) -> str:
        """Resolve the true client request path from Vercel rewrite headers."""
        for header in [
            "x-forwarded-uri",
            "x-matched-path",
            "x-invoke-path",
            "x-vercel-matched-path",
            "x-original-uri"
        ]:
            val = self.headers.get(header)
            if val:
                p = urllib.parse.urlparse(val).path
                if p and p not in ("/api/index.py", "/api/index", "/api"):
                    return p

        # Fallback to self.path
        parsed = urllib.parse.urlparse(self.path)
        p = parsed.path
        if p in ("/api/index.py", "/api/index", "/api", ""):
            return "/"
        return p

    def do_GET(self) -> None:
        real_path = self.get_request_path()
        orig_path = self.path
        query = urllib.parse.urlparse(orig_path).query
        self.path = real_path + (f"?{query}" if query else "")
        try:
            super().do_GET()
        finally:
            self.path = orig_path

    def do_POST(self) -> None:
        real_path = self.get_request_path()
        orig_path = self.path
        query = urllib.parse.urlparse(orig_path).query
        self.path = real_path + (f"?{query}" if query else "")
        try:
            super().do_POST()
        finally:
            self.path = orig_path
