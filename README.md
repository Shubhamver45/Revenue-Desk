# 💰 Revenue Desk

**Two AI agents and a human manager in one Switch room — analyzing data, catching errors, and taking action together.**

> Built for the [Flip the Switch Hackathon](https://devtoolsacademy.com) (Nov 4–7, 2026)

---

## What is Revenue Desk?

Revenue Desk is a **business intelligence workflow** powered by [Switch](https://switchagents.ai). A sales or ops manager asks a data question in a shared chat room, and two AI agents collaborate to deliver verified, actionable insights — with a human approval gate before anything gets executed.

### The Problem
AI agents can query databases and generate answers. But **who checks their work?** Wrong numbers lead to wrong decisions. Revenue Desk solves this with a built-in verification loop.

### The Flow

```
Manager asks question
        ↓
Analyst Agent queries the database, posts findings
        ↓
Reviewer Agent independently re-checks the numbers
        ↓
  ┌─── Numbers match? ───┐
  │                       │
  ✅ Verified         ⚠️ Discrepancy flagged
  │                       │
  └───────┬───────────────┘
          ↓
Analyst proposes an action (e.g., win-back campaign)
          ↓
   🔒 Human approves or rejects
          ↓
Agent executes → Decision logged
```

### Why Switch?

Without Switch, this is three disconnected tools. With Switch:
- Both agents and the manager share **one room** with full history
- The room's **Tasks** track what needs to be done
- The room's **Decisions** create an audit trail of what was approved and why
- The room's **Rules** enforce that agents can't act without approval
- Any teammate can join tomorrow and see the full context

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- An [Anthropic API key](https://console.anthropic.com/)
- [Switch Console](https://github.com/sandbox-quantum/switch) (for full integration)

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/revenue-desk.git
cd revenue-desk
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Install Dependencies

```bash
pip install anthropic matrix-nio python-dotenv
```

Or with uv:
```bash
uv sync
```

### 3. Run the Web Cockpit (React.js + Node.js)

```bash
# Option A: Start with Node.js (React 18 SPA + Gateway)
npm start
# Opens http://localhost:3000

# Option B: Start with Python directly
python3 app.py
# Opens http://localhost:8000
```

### 4. Run the CLI Demo (Terminal)

```bash
python main.py
```

This starts an interactive terminal where you play the manager:

```
💬 [Manager] > Why did repeat purchases drop in the West region last month?

[System] 📊 Routing question to Analyst Agent...

[Analyst] **Query:**
SELECT region, strftime('%Y-%m', order_date) as month, COUNT(*) as repeat_orders ...

**Findings:** West region repeat purchases dropped from 14 in September to 4 in October...

[System] 🔍 Reviewer Agent is independently verifying...

[Reviewer] ⚠️ **Discrepancy Found**
**Issue:** Analyst counted 12 repeat orders in October, but 8 of those were fully refunded...
**Analyst reported:** $24,250 total West revenue
**My independent check shows:** $3,820 net revenue (after $20,430 in refunds)...

[System] ⚠️ Discrepancy detected! ...

[Analyst] 📋 **Proposed Action: West Enterprise Win-Back Campaign**
**What:** Targeted outreach to 5 lapsed enterprise customers...

🔒 [Manager — enter approval] > Approved. Change discount from 10% to 15%.

[Analyst] ✅ Campaign Executed — 3 database operations completed.
📝 Decision logged. Task complete.
```

### 4. Run with Switch (Full Integration)

```bash
# Set Switch credentials in .env, then:
MODE=bridge python main.py
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Switch Room: #revenue-desk                │
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Manager  │    │   Analyst    │    │    Reviewer      │   │
│  │  (Human)  │    │   Agent      │    │    Agent         │   │
│  └─────┬────┘    └──────┬───────┘    └────────┬─────────┘   │
│        │                │                      │             │
│        │   Question     │                      │             │
│        ├───────────────►│                      │             │
│        │                │  Query DB            │             │
│        │                ├──────────┐           │             │
│        │                │          │           │             │
│        │                │◄─────────┘           │             │
│        │                │  Post findings       │             │
│        │◄───────────────┤                      │             │
│        │                │  Trigger verify      │             │
│        │                ├─────────────────────►│             │
│        │                │                      │  Query DB   │
│        │                │                      ├──────┐      │
│        │                │                      │      │      │
│        │                │                      │◄─────┘      │
│        │                │  Verify / Flag       │             │
│        │◄──────────────────────────────────────┤             │
│        │                │                      │             │
│        │  Approve       │                      │             │
│        ├───────────────►│                      │             │
│        │                │  Execute             │             │
│        │                ├──────────┐           │             │
│        │                │          │           │             │
│        │  Done + Log    │◄─────────┘           │             │
│        │◄───────────────┤                      │             │
│                                                              │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐                 │
│  │ History │  │  Tasks   │  │ Decisions  │   ← Switch UI    │
│  └─────────┘  └──────────┘  └────────────┘                 │
└──────────────────────────────────────────────────────────────┘
                        │
                   ┌────┴────┐
                   │ SQLite  │
                   │   DB    │
                   └─────────┘
```

---

## 📁 Project Structure

```
revenue-desk/
├── main.py               # Entry point (CLI or bridge mode)
├── src/
│   ├── analyst.py         # Analyst agent logic
│   ├── reviewer.py        # Reviewer agent logic
│   ├── workflow.py        # Workflow orchestrator (state machine)
│   ├── switch_bridge.py   # Switch/Matrix room integration
│   ├── database.py        # SQLite database layer
│   ├── llm.py             # LLM client (Anthropic Claude)
│   ├── prompts.py         # Agent prompt templates
│   └── config.py          # Environment configuration
├── seed/
│   └── init.sql           # Database schema + realistic seed data
├── switch/
│   ├── room.yaml          # Switch room configuration
│   └── agents.yaml        # Switch agent definitions
├── docker-compose.yml     # One-command Docker setup
├── Dockerfile
├── Makefile               # make run / make bridge / make test
├── pyproject.toml
└── .env.example
```

---

## 🎯 Key Features

| Feature | Why It Matters |
|---------|---------------|
| **Two-agent verification** | Analyst answers, Reviewer independently checks. Catches wrong numbers before humans act on them. |
| **Human approval gate** | No action executes without manager sign-off. Agents propose, humans decide. |
| **Visible disagreement** | When agents disagree, the workflow stops and shows exactly where numbers differ. |
| **Decision audit trail** | Every approval is logged with who/what/when. Next person sees full context. |
| **Switch Tasks & Decisions** | Native Switch features used as the control mechanism, not decoration. |
| **Seeded demo scenario** | Includes realistic sales data with a built-in "West region drop" story and a hidden refund discrepancy. |
| **One-command setup** | `pip install && python main.py` or `docker-compose up` |

---

## 🗄️ Seed Data Story

The database comes pre-loaded with a realistic scenario:

- **80 customers** across 4 regions (West, East, Central, South)
- **237 orders** from June–October 2026
- **The drop:** 5 high-value West enterprise customers placed large repeat orders every month from June–September, then stopped completely in October
- **The trap:** 8 October orders for West mid-market customers were later refunded due to a pricing glitch (\$20,430 total). A naive query will overcount West October revenue by ~84%.

This creates the perfect demo moment — the Analyst reports one number, the Reviewer catches the refund issue, and the true picture is even worse than it first appeared.

---

## 📜 License

MIT

---

## 🙏 Built With

- [Switch](https://switchagents.ai) — Open-source infrastructure for AI teammates
- [Claude](https://anthropic.com) — Language model by Anthropic
- [SQLite](https://sqlite.org) — Embedded database
- [matrix-nio](https://github.com/matrix-nio/matrix-nio) — Matrix protocol client

