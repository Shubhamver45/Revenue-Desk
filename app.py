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

from src.database import init_database, run_query, run_write
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

        if path in ("/", "/index.html", "/dashboard"):
            self.serve_ui("index.html")
        elif path in ("/landing", "/landing.html", "/login"):
            self.serve_ui("landing.html")
        elif path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
        elif path == "/api/auth/session":
            self.send_json({"status": "ok", "active": True})
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
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()
            name = data.get("name", "").strip()
            company = data.get("company", "").strip()
            provider = data.get("provider", "credentials")
            is_signup = path == "/api/auth/register" or data.get("is_signup", False)

            if not email and provider != "google":
                self.send_json({"error": "Email address is required"}, status=400)
                return

            if is_signup:
                user_name = name or email.split("@")[0].replace(".", " ").title()
                company_name = company or "My SaaS Inc."
                user_role = "Revenue Operations Lead"
            else:
                user_name = name or ("Alex Rivera" if ("alex" in email.lower() or provider == "google" or not email) else email.split("@")[0].replace(".", " ").title())
                company_name = company or "Acme Cloud Inc."
                user_role = "VP Revenue Operations"

            avatar = "".join([p[0].upper() for p in user_name.split()[:2]]) or "U"
            seed_str = f"{email}:{password}:{time.time()}"
            token = f"rd_sess_{hashlib.sha256(seed_str.encode()).hexdigest()[:24]}"

            auth_response = {
                "status": "ok",
                "authenticated": True,
                "is_new_user": is_signup,
                "token": token,
                "user": {
                    "name": user_name,
                    "email": email or "alex.rivera@acmecloud.com",
                    "role": user_role,
                    "company": company_name,
                    "avatar": avatar,
                    "provider": provider,
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

    def serve_ui(self, filename: str = "index.html") -> None:
        html_file = ROOT_DIR / "src" / "ui" / filename
        if not html_file.exists():
            self.send_error(404, f"{filename} not found")
            return
        
        content = html_file.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
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
