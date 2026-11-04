#!/usr/bin/env python3
"""Revenue Desk — Executive Decision & Campaign Report Generator.

Exports an executive HTML report showing:
1. Workflow timeline & participants
2. SQL queries executed
3. Discrepancy caught by Reviewer
4. Approved campaign & target list
5. Full Switch decision lineage audit log
"""

import os
import sys
import webbrowser
from pathlib import Path
from datetime import datetime

# Add root directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.database import run_query, get_db_path


def generate_html_report(output_path: str = "data/executive_report.html") -> str:
    db_path = get_db_path()
    
    # Query database for recent campaigns and decisions
    campaigns = run_query("SELECT * FROM campaigns ORDER BY id DESC LIMIT 5", db_path=db_path)
    targets = run_query("""
        SELECT ct.id, c.name as customer_name, c.segment, c.region, ct.message
        FROM campaign_targets ct
        JOIN customers c ON ct.customer_id = c.id
        ORDER BY ct.id ASC LIMIT 10
    """, db_path=db_path)
    decisions = run_query("SELECT * FROM decision_log ORDER BY id DESC", db_path=db_path)
    
    # Customer summary
    cust_summary = run_query("""
        SELECT region, segment, count(*) as count 
        FROM customers GROUP BY region, segment
    """, db_path=db_path)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Revenue Desk — Executive Decision Report</title>
    <style>
        :root {{
            --bg: #0d1117;
            --surface: #161b22;
            --border: #30363d;
            --text: #c9d1d9;
            --accent: #58a6ff;
            --green: #238636;
            --yellow: #d29922;
            --red: #f85149;
            --purple: #bc8cff;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 24px;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
        }}
        .header {{
            border-bottom: 1px solid var(--border);
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 26px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .badge {{
            background: #1f6feb;
            color: #fff;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
        }}
        .card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }}
        .card h2 {{
            margin-top: 0;
            font-size: 18px;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
        }}
        .tag-green {{ color: #3fb950; font-weight: bold; }}
        .tag-yellow {{ color: #e3b341; font-weight: bold; }}
        .tag-purple {{ color: #d2a8ff; font-weight: bold; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
        }}
        th, td {{
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background: #21262d;
            color: #8b949e;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }}
        tr:hover td {{
            background: rgba(255,255,255,0.02);
        }}
        pre {{
            background: #090d13;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 12px;
            overflow-x: auto;
            font-size: 13px;
            color: #79c0ff;
        }}
        .grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }}
        .meta-pill {{
            background: #21262d;
            border: 1px solid var(--border);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            display: inline-block;
            margin-right: 6px;
        }}
        .footer {{
            text-align: center;
            font-size: 12px;
            color: #8b949e;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>💰 Revenue Desk <span class="badge">Switch Room #revenue-desk</span></h1>
                <div style="font-size: 13px; color: #8b949e; margin-top: 4px;">
                    Multi-Agent Business Workflow Audit & Decision Report
                </div>
            </div>
            <div style="text-align: right;">
                <div class="meta-pill">Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</div>
                <div class="meta-pill" style="color: #3fb950;">Room State: COMPLETED</div>
            </div>
        </div>

        <div class="card">
            <h2>👥 Room Participants & Roles</h2>
            <div class="grid">
                <div>
                    <strong>🧑‍💼 Human Manager:</strong> Asks strategic business questions, audits discrepancies, holds sole execution authority.<br>
                    <strong>🤖 Analyst Agent:</strong> Discovers root cause using SQL, evaluates gross trends, and drafts action proposals.
                </div>
                <div>
                    <strong>🛡️ Reviewer Agent:</strong> Independently executes verification SQL, uncovers refunds & billing errors, guards data integrity.<br>
                    <strong>⚡ Switch Hub:</strong> Manages shared state, task lineage, and tamper-proof decision history.
                </div>
            </div>
        </div>

        <div class="card">
            <h2>⚡ Recent Decisions Logged in Room</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Decision Record</th>
                        <th>Approved By</th>
                        <th>Context & Trigger</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    if decisions:
        for d in decisions:
            html += f"""
                    <tr>
                        <td><code>#{d['id']}</code></td>
                        <td><strong style="color: #58a6ff;">{d['decision']}</strong></td>
                        <td><span class="meta-pill">{d['made_by']}</span></td>
                        <td>{d.get('context', '—')}</td>
                        <td>{d.get('created_at', '—')}</td>
                    </tr>
            """
    else:
        html += "<tr><td colspan='5'>No decisions recorded yet. Run main.py to generate your first workflow.</td></tr>"

    html += f"""
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>📋 Executed Campaigns & Target Allocations</h2>
            <table>
                <thead>
                    <tr>
                        <th>Campaign Name</th>
                        <th>Target Scope</th>
                        <th>Discount Rate</th>
                        <th>Status</th>
                        <th>Author / Sign-off</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    if campaigns:
        for c in campaigns:
            html += f"""
                    <tr>
                        <td><strong>{c['name']}</strong></td>
                        <td>{c['target_region'].upper()} • {c['target_segment']}</td>
                        <td><span class="tag-green">{c['discount_pct']}%</span></td>
                        <td><span class="meta-pill" style="color: #3fb950; font-weight: bold;">{c['status'].upper()}</span></td>
                        <td>{c['created_by']} ➔ <strong>{c['approved_by']}</strong></td>
                    </tr>
            """
    else:
        html += "<tr><td colspan='5'>No campaigns executed yet.</td></tr>"

    html += f"""
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>🎯 Sample Dispatched Campaign Targets</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer Account</th>
                        <th>Tier</th>
                        <th>Region</th>
                        <th>Personalized Outreach Message</th>
                    </tr>
                </thead>
                <tbody>
    """

    if targets:
        for t in targets:
            html += f"""
                    <tr>
                        <td>#{t['id']}</td>
                        <td><strong>{t['customer_name']}</strong></td>
                        <td>{t['segment']}</td>
                        <td>{t['region']}</td>
                        <td><em>"{t['message']}"</em></td>
                    </tr>
            """
    else:
        html += "<tr><td colspan='5'>No targets recorded in current run.</td></tr>"

    html += f"""
                </tbody>
            </table>
        </div>

        <div class="footer">
            Built with <strong>Switch AI</strong> • DevTools Academy Hackathon 2026 • Revenue Desk Project
        </div>
    </div>
</body>
</html>
    """

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(html, encoding="utf-8")
    print(f"✅ Executive report generated at: {out_file.resolve()}")
    return str(out_file.resolve())


if __name__ == "__main__":
    path = generate_html_report()
    print(f"Open this file in your browser to view:\nfile://{path}")
