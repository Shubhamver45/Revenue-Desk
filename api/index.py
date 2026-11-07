import os
import sys
import urllib.parse
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# On Vercel serverless environments, redirect SQLite database to writable /tmp
os.environ.setdefault("DB_PATH", "/tmp/revenue_desk.db")

from src.database import init_database
from app import SwitchAppHandler

# Ensure database is seeded on lambda cold start
init_database()


class handler(SwitchAppHandler):
    """Vercel Serverless Function entry point inheriting from SwitchAppHandler."""

    def get_request_path(self) -> tuple:
        """Resolve the true client request path and query string."""
        orig_parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(orig_parsed.query)

        # 1. Check __route query parameter injected by vercel rewrite
        if "__route" in qs:
            route = qs.pop("__route")[0].strip("/")
            clean_query = urllib.parse.urlencode([(k, v) for k, vs in qs.items() for v in vs])
            clean_route = f"/api/{route}" if route else "/api/state"
            return clean_route, clean_query

        # 2. Check Vercel proxy headers
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
                clean_p = p.rstrip("/")
                if clean_p and not clean_p.endswith(".py"):
                    return clean_p, orig_parsed.query

        # 3. Check self.path directly
        clean_path = orig_parsed.path.rstrip("/")
        if clean_path and not clean_path.endswith(".py"):
            return clean_path, orig_parsed.query

        # Default to root UI "/"
        return "/", orig_parsed.query

    def do_GET(self) -> None:
        real_path, query = self.get_request_path()
        orig_path = self.path
        self.path = real_path + (f"?{query}" if query else "")
        try:
            super().do_GET()
        finally:
            self.path = orig_path

    def do_POST(self) -> None:
        real_path, query = self.get_request_path()
        orig_path = self.path
        self.path = real_path + (f"?{query}" if query else "")
        try:
            super().do_POST()
        finally:
            self.path = orig_path
