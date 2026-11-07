# 🚀 Building Revenue Desk: How to Build Governed Multi-Agent Teams with Switch

> **A practical guide to building collaborative multi-agent Switch Rooms where humans and AI work together to run high-stakes business operations without hallucinations.**
>
> 👤 **Author:** Shubham Vernekar  
> ⚡ **Live Cockpit:** [https://revenue-desk-gamma.vercel.app](https://revenue-desk-gamma.vercel.app)  
> 🌐 **Interactive Blog Post:** [https://revenue-desk-gamma.vercel.app/blog](https://revenue-desk-gamma.vercel.app/blog)  
> 🏆 **Event:** Flip the Switch AI Hackathon 2026

---

## 📌 Introduction: The Multi-Agent Reliability Crisis

Large Language Models (LLMs) can now write complex SQL queries, summarize revenue metrics, and draft client communications in seconds. But in mission-critical business operations—especially finance—**an autonomous AI operating in isolation is dangerous.**

Consider a common scenario: An executive asks an AI agent, *"Why did repeat purchases drop in the West region last month?"*
1. The AI queries the `orders` table.
2. It sees that order volume dropped by 84%.
3. It immediately concludes: *"Your enterprise customers are churning! You should offer a panic-driven 25% discount to win them back."*

What the naive agent missed was the payment processor's `refunds` ledger, where an unannounced payment gateway migration caused **$20,430 in duplicate refund reversals**. The customers never churned—they experienced a temporary billing glitch! By giving away a 25% discount, the company would have burned thousands in unnecessary margin.

To solve this, we built **Revenue Desk** using [Switch](https://switchagents.ai) — open-source infrastructure designed specifically for collaborative AI teammate workflows.

In this tutorial, we will walk you through how to use Switch to build a multi-agent financial command center with **independent peer verification, declarative governance rules, and human sign-off gates**.

---

## 🏗️ The Architecture: Two Agents, One Room, Total Transparency

Instead of building a lonely single-agent chatbot, Switch allows you to create a **shared collaborative room** (`#revenue-desk`) where multiple specialized agents and human teammates converse in real time.

```
                  ┌───────────────────────────────┐
                  │    Human Manager (@manager)   │
                  └──────────────┬────────────────┘
                                 │ Questions & Sign-Off
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                 SWITCH ROOM: #revenue-desk                  │
   │                                                             │
   │   Enforcing 5 Declarative Rules:                            │
   │   • rule-independent-audit     • rule-dual-agent-consensus  │
   │   • rule-human-in-the-loop     • rule-tamper-evident-audit  │
   │   • rule-read-only-sandbox                                  │
   │                                                             │
   │   ┌──────────────────────┐       ┌──────────────────────┐   │
   │   │    @analyst Agent    │◄─────►│   @reviewer Agent    │   │
   │   │  (SQL Query Engine)  │       │ (Independent Audit)  │   │
   │   └──────────┬───────────┘       └──────────┬───────────┘   │
   │              │                              │               │
   │              │   Consensus Protocol Engine  │               │
   │              └──────────────►◄──────────────┘               │
   │                              │                              │
   │                              ▼                              │
   │                 100% Verified Proposal Card                 │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │   Human Approval Gate    │
                     │  (Approve / Modify / Reject)
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │ Atomic Database Mutation │
                     │ & SHA-256 Decision Log   │
                     └──────────────────────────┘
```

### The Three Roles in the Room:
1. **`@manager` (Human Lead):** Sets strategic objectives, poses questions, inspects discrepancy diffs, and retains final approval authority.
2. **`@analyst` (Data Engine):** Translates plain-English inquiries into read-only SQL, queries the live transaction database, and formulates remediation proposals.
3. **`@reviewer` (Audit Guard):** An adversarial AI auditor that never trusts the Analyst blindly. It writes independent verification queries against secondary ledgers (refunds, fees, logs) to catch hidden anomalies.

---

## 🛠️ Step 1: Setting Up Your Switch Room

In Switch, rooms are defined declaratively. You specify who can join the room, what roles they play, and what rules govern their interactions.

Here is the `switch/room.yaml` configuration for Revenue Desk:

```yaml
room:
  id: "!revenue-desk:switch.local"
  name: "#revenue-desk"
  topic: "Governed Financial Operations & Revenue Intelligence"
  visibility: private
  encryption: true

agents:
  - id: "@analyst:switch.local"
    display_name: "Analyst Agent"
    role: "financial_analyst"
    model: "groq/llama-3.3-70b"
    capabilities:
      - "sql_generation"
      - "ledger_analysis"

  - id: "@reviewer:switch.local"
    display_name: "Reviewer Agent"
    role: "audit_guardrail"
    model: "gemini/gemini-2.0-flash"
    capabilities:
      - "independent_verification"
      - "discrepancy_detection"

members:
  - id: "@manager:switch.local"
    role: "human_lead"
    permissions:
      - "approve_campaigns"
      - "execute_mutations"
```

---

## 📜 Step 2: Defining Declarative Governance Rules

The real superpower of Switch is that **governance is enforced by the room, not by hoping an LLM behaves.** 

We configured **5 Declarative Rules** in `switch/rules.yaml`:

```yaml
rules:
  # Rule 1: Every analysis must be independently verified
  - id: "rule-independent-audit"
    trigger: "event.type == 'analyst.findings'"
    action: "invoke_agent"
    target: "@reviewer"
    payload:
      task: "verify_findings"
      strict_mode: true

  # Rule 2: Both agents must reach consensus before a proposal is formed
  - id: "rule-dual-agent-consensus"
    condition: "analyst.net_revenue == reviewer.net_revenue"
    on_failure: "block_proposal"

  # Rule 3: No external action without human sign-off
  - id: "rule-human-in-the-loop"
    trigger: "event.type == 'campaign.proposal'"
    enforce: "require_approval"
    approver: "@manager"

  # Rule 4: Cryptographic decision ledger
  - id: "rule-tamper-evident-audit"
    on_event: "*"
    action: "append_sha256_audit_trail"

  # Rule 5: Database security sandbox
  - id: "rule-read-only-sandbox"
    enforce: "disallow_sql_mutation_for_agents"
```

---

## 💡 Step 3: Implementing the Dual-Agent Consensus Workflow

Let's look at how the verification loop works in Python using Switch's state machine:

```python
from src.workflow import RevenueDesk, WorkflowState

# Initialize the Switch Room workflow
desk = RevenueDesk()

# 1. Human Manager asks a question in the room
context = desk.ask("Why did repeat purchases drop in the West region last month?")

# 2. Analyst Agent generates query and analyzes findings
print("Analyst Findings:", context.analyst_findings)
# Output: Identifies 5 lapsed enterprise accounts in West region

# 3. Reviewer Agent independently queries secondary tables
print("Reviewer Audit:", context.reviewer_audit)
# Output: Detects $20,430 duplicate refund glitch on orders #1, #2, and #3

# 4. Consensus Engine reconciles numbers
if desk.check_consensus(context):
    print("✅ Multi-Agent Consensus Sealed: 100% mathematical alignment.")
    
# 5. Human Approval Gate
# The action CANNOT execute until @manager signs off
desk.approve(context, campaign_id="CAMP-2026-WEST", modified_discount=15)
print("🚀 Campaign Executed with Manager Sign-off!")
```

---

## 🎯 What First-Time Switch Builders Should Know

If you are building your first multi-agent workflow on Switch, keep these three lessons in mind:

### 1. Separate Analysis from Verification
Never ask a single LLM to "double-check its own answer." LLMs suffer from self-confirmation bias. In Switch, spin up **two distinct agent personas** (`@analyst` and `@reviewer`) with distinct instructions and prompt contexts. Have the second agent write its own SQL query from scratch rather than reading the first agent's SQL.

### 2. Use Switch Tasks to Prevent Context Rot
As conversations grow long, LLMs lose track of what has been finished. Revenue Desk uses **Switch Tasks** (`TASK-101` through `TASK-105`) to maintain an explicit Kanban state:
- `TASK-101`: Ingest Manager Inquiry (Completed)
- `TASK-102`: Execute Primary SQL Analysis (Completed)
- `TASK-103`: Run Reviewer Audit & Catch Discrepancies (Completed)
- `TASK-104`: Seal Multi-Agent Consensus (Completed)
- `TASK-105`: Awaiting Human Manager Approval (Pending Sign-off)

### 3. Anchor Decisions in an Immutable Ledger
Executives don't just want AI recommendations—they need an audit trail for compliance. Switch’s **Decision Ledger** attaches a cryptographic SHA-256 hash to every approved action, recording who asked, who analyzed, who verified, and who authorized the transaction.

---

## 🚀 How to Run Revenue Desk Locally

Revenue Desk is built to be 100% reproducible with zero configuration:

```bash
# 1. Clone the repository
git clone https://github.com/Shubhamver45/Revenue-Desk.git
cd Revenue-Desk

# 2. Start the executive cockpit
python3 app.py
# Or using modern full-stack gateway: npm install && npm start

# 3. Open in your browser
open http://localhost:8000

# 4. Run the automated test suite (17/17 tests pass in 2.5s)
python3 -m unittest discover tests -v
```

---

## 🏁 Conclusion: The Future of Governed AI Workflows

The real potential of AI teammates is not replacing humans, but amplifying human decision-making with **speed, mathematical accuracy, and ironclad governance**.

Switch provides the missing foundation that makes multi-agent workflows viable for real-world enterprise operations. By combining room-based collaboration, declarative rules, and human-in-the-loop controls, you can deploy AI agents that your CFO, legal team, and executive leadership can genuinely trust.

* **GitHub Repository:** [https://github.com/Shubhamver45/Revenue-Desk](https://github.com/Shubhamver45/Revenue-Desk)
* **Built With:** [Switch AI](https://switchagents.ai) for the Flip the Switch Hackathon 2026.

