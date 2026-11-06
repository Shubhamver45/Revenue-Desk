"""Revenue Desk — Modern Web Server & Live Switch Room Experience.

Serves a modern, light-theme Switch Room UI (Apple / Stripe / Linear style)
with interactive agent collaboration, live SQL inspection, side-by-side
discrepancy comparison, approval controls, and Switch Task/Decision sidebars.
"""

from __future__ import annotations

import datetime
import hashlib
import json
import os
import sys
import time
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Any

# Ensure project root is in path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))

from src.database import get_connection, init_database, run_query, run_write
from src.workflow import RevenueDesk, WorkflowState

PORT = int(os.getenv("PORT", "5050"))
desk: RevenueDesk | None = None


def get_or_create_desk() -> RevenueDesk:
    global desk
    if desk is None:
        init_database()
        desk = RevenueDesk()
    return desk


class SwitchAppHandler(SimpleHTTPRequestHandler):
    """Handles REST API and UI rendering for Revenue Desk."""

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ("/", "/index.html", "/dashboard", "/api/index.py", "/api/index"):
            self.serve_ui("index.html")
        elif path in ("/landing", "/landing.html", "/login"):
            self.serve_ui("landing.html")
        elif path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
        elif path == "/api/auth/session":
            self.send_json({"status": "ok", "active": True})
        elif path in ("/api/metrics", "/api/metrics/live"):
            self.send_json(self.get_live_metrics())
        elif path == "/api/switch/template":
            yaml_path = ROOT_DIR / "switch" / "revenue-desk.template.yaml"
            room_path = ROOT_DIR / "switch" / "room.yaml"
            yaml_content = yaml_path.read_text() if yaml_path.exists() else ""
            room_content = room_path.read_text() if room_path.exists() else ""
            self.send_json({
                "status": "ok",
                "template_yaml": yaml_content,
                "room_yaml": room_content
            })
        elif path == "/api/state":
            self.send_json(self.get_room_state())
        elif path == "/api/database":
            self.send_json(self.get_database_dump())
        elif path == "/api/reset":
            global desk
            desk = None
            init_database()
            desk = RevenueDesk()
            self.send_json({"status": "ok", "message": "Room state reset."})
        else:
            self.send_error(404, "Endpoint not found")

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            data = {}

        if path in ("/api/auth/login", "/api/auth/register"):
            email = data.get("email", "").strip().lower()
            password = data.get("password", "").strip()
            name = data.get("name", "").strip()
            company = data.get("company", "").strip()
            provider = data.get("provider", "credentials")
            is_signup = path == "/api/auth/register" or data.get("is_signup", False)

            if not email and provider != "google":
                self.send_json({"error": "Email address is required"}, status=400)
                return

            pwd_hash = hashlib.sha256(password.encode()).hexdigest() if password else ""

            # Real database lookup and mutation
            with get_connection() as conn:
                cur = conn.cursor()

                # Ensure users table exists
                cur.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id            INTEGER PRIMARY KEY AUTOINCREMENT,
                        email         TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        name          TEXT NOT NULL,
                        company       TEXT NOT NULL DEFAULT 'Acme Cloud Inc.',
                        role          TEXT NOT NULL DEFAULT 'VP Revenue Operations',
                        provider      TEXT NOT NULL DEFAULT 'credentials',
                        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                ''')

                if is_signup:
                    # Check if user already exists
                    cur.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,))
                    if cur.fetchone():
                        self.send_json({"error": "An account with this email already exists. Please sign in."}, status=400)
                        return

                    user_name = name or email.split("@")[0].replace(".", " ").title()
                    company_name = company or "My SaaS Inc."
                    user_role = "Revenue Operations Lead"

                    cur.execute('''
                        INSERT INTO users (email, password_hash, name, company, role, provider)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (email, pwd_hash, user_name, company_name, user_role, provider))
                    conn.commit()

                    cur.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
                    user_row = dict(cur.fetchone())

                elif provider == "google":
                    # Google Sign-in: lookup or auto-provision
                    cur.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
                    row = cur.fetchone()
                    if row:
                        user_row = dict(row)
                    else:
                        user_name = name or email.split("@")[0].replace(".", " ").title()
                        company_name = company or "Acme Cloud Inc."
                        cur.execute('''
                            INSERT INTO users (email, password_hash, name, company, role, provider)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (email, 'google_oauth_hash', user_name, company_name, 'VP Revenue Operations', 'google'))
                        conn.commit()
                        cur.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
                        user_row = dict(cur.fetchone())

                else:
                    # Normal Credentials Login: real email & password verification
                    cur.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,))
                    row = cur.fetchone()
                    if not row:
                        self.send_json({"error": f"No account found for {email}. Please click 'Create an account'."}, status=401)
                        return

                    user_row = dict(row)
                    if user_row["password_hash"] != 'google_oauth_hash' and user_row["password_hash"] != pwd_hash:
                        self.send_json({"error": "Incorrect password. Please verify and try again."}, status=401)
                        return

            user_name = user_row["name"]
            company_name = user_row["company"]
            user_role = user_row["role"]
            avatar = "".join([p[0].upper() for p in user_name.split()[:2]]) or "U"
            seed_str = f"{email}:{time.time()}"
            token = f"rd_sess_{hashlib.sha256(seed_str.encode()).hexdigest()[:24]}"

            auth_response = {
                "status": "ok",
                "authenticated": True,
                "is_new_user": is_signup,
                "token": token,
                "user": {
                    "id": user_row.get("id"),
                    "name": user_name,
                    "email": user_row["email"],
                    "role": user_role,
                    "company": company_name,
                    "avatar": avatar,
                    "provider": user_row["provider"],
                    "login_time": datetime.datetime.now().isoformat()
                }
            }
            self.send_json(auth_response)

        elif path == "/api/ask":
            try:
                question = data.get("question", "Why did repeat purchases drop in the West region last month?")
                d = get_or_create_desk()
                ctx = d.ask(question)
                self.send_json(self.get_room_state())
            except Exception as e:
                import traceback
                traceback.print_exc()
                d = get_or_create_desk()
                d._post("System", f"⚠️ Notice during execution: {str(e)}")
                self.send_json(self.get_room_state())

        elif path == "/api/approve":
            try:
                response = data.get("response", "Approved. Change discount to 15%.")
                d = get_or_create_desk()
                result = d.approve(response)
                self.send_json({"result": result, "state": self.get_room_state()})
            except Exception as e:
                import traceback
                traceback.print_exc()
                self.send_json({"error": str(e), "state": self.get_room_state()})

        else:
            self.send_error(404, "Endpoint not found")

    def send_json(self, data: Any, status: int = 200) -> None:
        content = json.dumps(data, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(content)

    def get_room_state(self) -> dict[str, Any]:
        d = get_or_create_desk()
        ctx = d.current
        
        # Load decisions from DB
        decisions = run_query("SELECT * FROM decision_log ORDER BY id DESC LIMIT 10")
        campaigns = run_query("SELECT * FROM campaigns ORDER BY id DESC LIMIT 5")
        targets = run_query("""
            SELECT ct.id, c.name as customer_name, c.segment, c.region, ct.message
            FROM campaign_targets ct
            JOIN customers c ON ct.customer_id = c.id
            ORDER BY ct.id ASC LIMIT 10
        """)

        return {
            "current_state": ctx.state.name if ctx else "IDLE",
            "question": ctx.question if ctx else None,
            "messages": ctx.messages if ctx else [],
            "analysis": {
                "sql": ctx.analysis.sql_query if ctx and ctx.analysis else None,
                "response": ctx.analysis.llm_response if ctx and ctx.analysis else None,
                "raw_data": ctx.analysis.raw_data if ctx and ctx.analysis else [],
            } if ctx and ctx.analysis else None,
            "review": {
                "sql": ctx.review.reviewer_sql if ctx and ctx.review else None,
                "response": ctx.review.llm_response if ctx and ctx.review else None,
                "is_verified": ctx.review.is_verified if ctx and ctx.review else None,
                "raw_data": ctx.review.reviewer_data if ctx and ctx.review else [],
            } if ctx and ctx.review else None,
            "proposed_action": ctx.proposed_action if ctx else None,
            "execution_result": ctx.execution_result if ctx else None,
            "decisions": decisions,
            "campaigns": campaigns,
            "targets": targets,
            "tasks": [
                {
                    "id": "TASK-101",
                    "title": "Investigate West region repeat purchase decline",
                    "assigned_to": "Analyst Agent",
                    "status": "completed" if ctx and ctx.analysis else "in_progress" if ctx else "todo",
                },
                {
                    "id": "TASK-102",
                    "title": "Audit October revenue, refunds & billing anomalies",
                    "assigned_to": "Reviewer Agent",
                    "status": "completed" if ctx and ctx.review else "in_progress" if ctx and ctx.state.name == "REVIEWING" else "todo",
                },
                {
                    "id": "TASK-103",
                    "title": "Synthesize findings & propose win-back campaign",
                    "assigned_to": "Analyst Agent",
                    "status": "completed" if ctx and ctx.proposed_action else "todo",
                },
                {
                    "id": "TASK-104",
                    "title": "Human manager approval gate for campaign launch",
                    "assigned_to": "Human Manager",
                    "status": "completed" if ctx and ctx.state.name == "COMPLETE" else "in_progress" if ctx and ctx.state.name == "AWAITING_APPROVAL" else "todo",
                },
                {
                    "id": "TASK-105",
                    "title": "Execute campaign mutations & record Switch decision lineage",
                    "assigned_to": "Analyst Agent",
                    "status": "completed" if ctx and ctx.execution_result else "todo",
                },
            ]
        }

    def get_database_dump(self) -> dict[str, Any]:
        return {
            "customers": run_query("SELECT id, name, segment, region, created_at FROM customers ORDER BY id ASC LIMIT 80"),
            "orders": run_query("""
                SELECT o.id, c.name as customer_name, c.region, o.amount, o.order_date, o.is_repeat
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                ORDER BY o.order_date DESC, o.id DESC LIMIT 60
            """),
            "refunds": run_query("""
                SELECT r.id, r.order_id, c.name as customer_name, c.region, r.amount, r.reason, r.refund_date
                FROM refunds r
                JOIN orders o ON r.order_id = o.id
                JOIN customers c ON o.customer_id = c.id
                ORDER BY r.refund_date DESC, r.id DESC
            """),
            "campaigns": run_query("SELECT * FROM campaigns ORDER BY id DESC LIMIT 10"),
            "decisions": run_query("SELECT * FROM decision_log ORDER BY id DESC LIMIT 20"),
            "counts": {
                "customers": run_query("SELECT COUNT(*) as c FROM customers")[0]["c"],
                "orders": run_query("SELECT COUNT(*) as c FROM orders")[0]["c"],
                "refunds": run_query("SELECT COUNT(*) as c FROM refunds")[0]["c"],
                "refunds_total": run_query("SELECT SUM(amount) as s FROM refunds")[0]["s"],
            }
        }

    def get_live_metrics(self) -> dict[str, Any]:
        """Compute 100% dynamic analytics directly from real live database rows."""
        # 1. West Region October Gross & Net
        west_oct = run_query("""
            SELECT 
                COUNT(o.id) as order_count,
                COALESCE(SUM(o.amount), 0) as gross_revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
              AND o.order_date >= '2026-10-01' AND o.order_date <= '2026-10-31'
        """)[0]

        west_refunds = run_query("""
            SELECT 
                COUNT(r.id) as refund_count,
                COALESCE(SUM(r.amount), 0) as refund_total
            FROM refunds r
            JOIN orders o ON r.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
              AND r.refund_date >= '2026-10-01' AND r.refund_date <= '2026-10-31'
        """)[0]

        gross_revenue = float(west_oct["gross_revenue"])
        refund_total = float(west_refunds["refund_total"])
        net_revenue = gross_revenue - refund_total

        # 2. September vs October Repeat Purchase Comparison (Real database calculation)
        sept_repeat = run_query("""
            SELECT 
                COUNT(o.id) as repeat_count,
                COALESCE(SUM(o.amount), 0) as repeat_revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
              AND o.is_repeat = 1
              AND o.order_date >= '2026-09-01' AND o.order_date <= '2026-09-30'
        """)[0]

        oct_clean_repeat = run_query("""
            SELECT 
                COUNT(o.id) as repeat_count,
                COALESCE(SUM(o.amount), 0) as repeat_revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
              AND o.is_repeat = 1
              AND o.order_date >= '2026-10-01' AND o.order_date <= '2026-10-31'
              AND o.id NOT IN (SELECT order_id FROM refunds)
        """)[0]

        sept_rep_rev = float(sept_repeat["repeat_revenue"]) or 1.0
        oct_rep_rev = float(oct_clean_repeat["repeat_revenue"])
        # Real math: percentage drop between September and October clean repeat spend
        repeat_drop_pct = round(((oct_rep_rev - sept_rep_rev) / sept_rep_rev) * 100, 1)

        # 3. Churned Enterprise Accounts (Exact live database match)
        churned_enterprise = run_query("""
            SELECT c.id, c.name,
                   COALESCE(SUM(o.amount), 0) as sept_revenue
            FROM customers c
            JOIN orders o ON c.id = o.customer_id
            WHERE c.region = 'west'
              AND c.segment = 'enterprise'
              AND o.order_date >= '2026-09-01' AND o.order_date <= '2026-09-30'
            GROUP BY c.id, c.name
            HAVING (
                SELECT COUNT(*) FROM orders 
                WHERE customer_id = c.id 
                  AND order_date >= '2026-10-01' AND order_date <= '2026-10-31'
            ) = 0
        """)

        # 4. Trajectory Data Points Directly Grouped By Month from Database
        monthly_db = run_query("""
            SELECT 
                strftime('%Y-%m', o.order_date) as month,
                COALESCE(SUM(o.amount), 0) as gross
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
            GROUP BY month
            ORDER BY month ASC
        """)

        month_names = {"06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct"}
        trajectory = []
        for m in monthly_db:
            m_str = m["month"]
            m_code = m_str.split("-")[-1]
            label = month_names.get(m_code, m_str)
            gross_val = float(m["gross"])
            clean_net = gross_val - refund_total if m_code == "10" else gross_val
            trajectory.append({
                "month_code": m_str,
                "label": label,
                "gross": gross_val,
                "net": clean_net
            })

        # 5. Live Production Counts Across Database
        global_stats = run_query("""
            SELECT 
                (SELECT COUNT(*) FROM customers) as customer_count,
                (SELECT COUNT(*) FROM orders) as order_count,
                (SELECT COALESCE(SUM(amount), 0) FROM orders) as all_time_orders_sum,
                (SELECT COUNT(*) FROM refunds) as total_refund_count,
                (SELECT COALESCE(SUM(amount), 0) FROM refunds) as total_refunds_sum
        """)[0]

        return {
            "status": "ok",
            "source": "live_database",
            "timestamp": datetime.datetime.now().isoformat(),
            "region": "west",
            "gross_revenue": gross_revenue,
            "refund_total": refund_total,
            "net_revenue": net_revenue,
            "order_count": int(west_oct["order_count"]),
            "refund_count": int(west_refunds["refund_count"]),
            "clean_order_count": int(west_oct["order_count"]) - int(west_refunds["refund_count"]),
            "september_repeat_revenue": sept_rep_rev,
            "october_repeat_revenue": oct_rep_rev,
            "repeat_drop_pct": repeat_drop_pct,
            "churned_enterprise_count": len(churned_enterprise),
            "churned_enterprise": churned_enterprise,
            "trajectory": trajectory,
            "global_stats": global_stats,
            "database_engine": os.getenv("DB_ENGINE", "sqlite"),
        }

    def serve_ui(self, filename: str = "index.html") -> None:
        html_file = ROOT_DIR / "src" / "ui" / filename
        if not html_file.exists():
            self.send_error(404, f"{filename} not found")
            return
        
        content = html_file.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.end_headers()
        self.wfile.write(content)


def run_server(port: int = PORT) -> None:
    init_database()
    import socket
    
    # Try finding an open port if default is busy
    test_port = port
    httpd = None
    for p in [test_port, 8000, 3000, 8080, 5050, 8888, 9090]:
        try:
            server_address = ("0.0.0.0", p)
            class ReuseHTTPServer(HTTPServer):
                allow_reuse_address = True
            httpd = ReuseHTTPServer(server_address, SwitchAppHandler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print("[ERROR] Could not bind to any available port.")
        return
    url = f"http://127.0.0.1:{port}"
    print(f"\n⚡ Revenue Desk 2026 Executive Cockpit is live at:")
    print(f"👉 {url}")
    print(f"👉 http://localhost:{port}\n")
    try:
        import subprocess
        subprocess.run(["open", url])
    except Exception:
        pass
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Revenue Desk server.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
