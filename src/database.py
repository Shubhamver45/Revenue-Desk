"""Revenue Desk — Database layer (SQLite & Supabase PostgreSQL)."""

from __future__ import annotations

import sqlite3
import os
from pathlib import Path
from contextlib import contextmanager
from typing import Any, Generator

try:
    from src.config import config
except ImportError:
    pass

SEED_SQL_PATH = Path(__file__).resolve().parent.parent / "seed" / "init.sql"


def get_db_path() -> str:
    return os.getenv("DB_PATH", "data/revenue_desk.db")


def init_database(db_path: str | None = None) -> None:
    """Create the database and load seed data if not already present."""
    db_path = db_path or get_db_path()
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)

    if os.path.exists(db_path):
        print(f"[DB] Database already exists at {db_path}")
        return

    print(f"[DB] Initialising database at {db_path} ...")
    conn = sqlite3.connect(db_path)
    with open(SEED_SQL_PATH, "r") as f:
        conn.executescript(f.read())
    conn.close()
    print(f"[DB] Seed data loaded successfully.")


@contextmanager
def get_connection(db_path: str | None = None) -> Generator[sqlite3.Connection, None, None]:
    """Context-managed database connection."""
    db_path = db_path or get_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


_supabase_offline = False


def run_supabase_sql(sql: str) -> list[dict[str, Any]]:
    """Execute raw SQL against Supabase over HTTPS via the exec_sql RPC function."""
    global _supabase_offline
    if _supabase_offline:
        raise RuntimeError("Supabase marked offline due to previous network block")

    import json
    import ssl
    import urllib.request

    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env to use Supabase")

    endpoint = f"{url}/rest/v1/rpc/exec_sql"
    payload = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "apikey": key,
            "Authorization": f"Bearer {key}"
        }
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=3) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if isinstance(data, list):
                return data
            return [data] if data else []
    except Exception as e:
        _supabase_offline = True
        raise e


def run_query(sql: str, params: tuple[Any, ...] = (), db_path: str | None = None) -> list[dict[str, Any]]:
    """Execute a read-only SQL query and return results as list of dicts."""
    if os.getenv("DB_ENGINE", "sqlite").lower() == "supabase":
        final_sql = sql
        for p in params:
            val = f"'{p}'" if isinstance(p, str) else str(p)
            final_sql = final_sql.replace("?", val, 1)
        try:
            return run_supabase_sql(final_sql)
        except Exception as e:
            print(f"[DB Warning] Supabase live query failed: {e}. Falling back to local SQLite.")

    with get_connection(db_path) as conn:
        cursor = conn.execute(sql, params)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]


def run_write(sql: str, params: tuple[Any, ...] = (), db_path: str | None = None) -> int:
    """Execute a write SQL statement. Returns lastrowid."""
    if os.getenv("DB_ENGINE", "sqlite").lower() == "supabase":
        final_sql = sql
        for p in params:
            val = f"'{p}'" if isinstance(p, str) else str(p)
            final_sql = final_sql.replace("?", val, 1)
        try:
            res = run_supabase_sql(final_sql)
            return 1
        except Exception as e:
            print(f"[DB Warning] Supabase live write failed: {e}. Falling back to SQLite.")

    with get_connection(db_path) as conn:
        cursor = conn.execute(sql, params)
        conn.commit()
        return cursor.lastrowid or 0


def run_transaction(operations: list[tuple[str, tuple[Any, ...]]], db_path: str | None = None) -> int:
    """Execute multiple SQL write statements inside an atomic transaction.
    Returns the lastrowid of the first statement.
    """
    if os.getenv("DB_ENGINE", "sqlite").lower() == "supabase":
        try:
            for sql, params in operations:
                final_sql = sql
                for p in params:
                    val = f"'{p}'" if isinstance(p, str) else str(p)
                    final_sql = final_sql.replace("?", val, 1)
                run_supabase_sql(final_sql)
            return 1
        except Exception as e:
            print(f"[DB Warning] Supabase live transaction failed: {e}. Falling back to SQLite.")

    with get_connection(db_path) as conn:
        last_id = 0
        for i, (sql, params) in enumerate(operations):
            cursor = conn.execute(sql, params)
            if i == 0:
                last_id = cursor.lastrowid or 0
        conn.commit()
        return last_id


def get_schema_description() -> str:
    """Return a human-readable description of the database schema for LLM context."""
    return """
DATABASE SCHEMA — Revenue Desk (SQLite)

Tables:
1. customers
   - id (INTEGER PK)
   - name (TEXT) — company name
   - segment (TEXT) — 'enterprise', 'mid-market', or 'smb'
   - region (TEXT) — 'west', 'east', 'central', or 'south'
   - created_at (DATE)

2. orders
   - id (INTEGER PK)
   - customer_id (INTEGER FK → customers.id)
   - amount (REAL) — order dollar amount
   - order_date (DATE)
   - is_repeat (INTEGER) — 0 = first purchase, 1 = repeat purchase

3. refunds
   - id (INTEGER PK)
   - order_id (INTEGER FK → orders.id)
   - amount (REAL) — refunded amount
   - reason (TEXT)
   - refund_date (DATE)
   NOTE: Not all orders have refunds. Refunded orders should be excluded from net revenue calculations.

4. campaigns
   - id (INTEGER PK AUTOINCREMENT)
   - name (TEXT)
   - target_segment (TEXT)
   - target_region (TEXT)
   - discount_pct (REAL, default 10.0)
   - status (TEXT) — 'draft', 'proposed', 'approved', 'executed', 'rejected'
   - created_by (TEXT)
   - approved_by (TEXT)
   - details (TEXT)
   - created_at (TIMESTAMP)
   - approved_at (TIMESTAMP)

5. campaign_targets
   - id (INTEGER PK AUTOINCREMENT)
   - campaign_id (INTEGER FK → campaigns.id)
   - customer_id (INTEGER FK → customers.id)
   - message (TEXT)

6. decision_log
   - id (INTEGER PK AUTOINCREMENT)
   - decision (TEXT)
   - made_by (TEXT)
   - context (TEXT)
   - created_at (TIMESTAMP)

Date range: June 2026 – October 2026
Regions: west, east, central, south
Segments: enterprise, mid-market, smb
""".strip()

