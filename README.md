# Revenue Desk 2.0
### Multi-Agent Financial Operations & Discrepancy Reconciliation Platform
**Flip the Switch Hackathon 2026 Submission**

[![Tests](https://img.shields.io/badge/Tests-17%2F17%20Passing-emerald)](tests/)
[![Switch Protocol](https://img.shields.io/badge/Switch-Protocol%20v2.0-blue)](switch/)
[![Live App](https://img.shields.io/badge/Live-revenue--desk--gamma.vercel.app-teal)](https://revenue-desk-gamma.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-slate)](LICENSE)

Revenue Desk transforms high-stakes corporate financial operations by replacing risky single-agent AI automations with a **Switch-governed multi-agent room** (`#revenue-desk`). An autonomous Analyst agent (`@analyst`) and an independent Adversarial Reviewer agent (`@reviewer`) cross-examine financial ledgers to catch duplicate refund glitches, expired card failures, and settlement holds before any human executive signs off on customer-facing promotions or database mutations.

---

## 🏛️ Architecture & System Topology

```text
                     ┌─────────────────────────────────────────────────┐
                     │          Human Executive (@manager)             │
                     │          Alex Rivera (VP of Finance)            │
                     └────────────────────────┬────────────────────────┘
                                              │ Inquiries & Explicit Sign-Off
                                              ▼
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │                       SHARED SWITCH ROOM: #revenue-desk                          │
   │           Governed by switch/room.yaml, switch/rules.yaml & switch_protocol.py   │
   │                                                                                  │
   │   Enforced Declarative Rules:                                                    │
   │   • Rule 1: Multi-Agent Room Required     • Rule 4: Human-in-the-Loop Sign-Off   │
   │   • Rule 2: Read-Only SQL Validation      • Rule 5: Cryptographic Hash-Chain     │
   │   • Rule 3: 100% Mathematical Consensus                                          │
   │                                                                                  │
   │   ┌───────────────────────────────┐           ┌──────────────────────────────┐   │
   │   │       @analyst Agent          │           │       @reviewer Agent        │   │
   │   │  (Groq Llama 3.3 70B Engine)  │◄─────────►│  (Gemini 2.0 Flash Auditor)  │   │
   │   │  • Queries Primary Orders     │           │  • Queries Secondary Ledgers │   │
   │   │  • Detects Apparent Volume    │           │  • Detects Anomaly Glitches  │   │
   │   └───────────────┬───────────────┘           └──────────────┬───────────────┘   │
   │                   │                                          │                   │
   │                   └───────────────────►◄─────────────────────┘                   │
   │                                        │                                         │
   │                        Deterministic Reconciliation                              │
   │                        Numerical Variance Check (<$1.00)                         │
   │                                        │                                         │
   │                                        ▼                                         │
   │                         Consensus Proposal Generated                             │
   └────────────────────────────────────────┬─────────────────────────────────────────┘
                                            │
                                            ▼
                          ┌───────────────────────────────────┐
                          │   Switch Rule #4 Approval Gate    │
                          │   • RBAC Role Verification        │
                          │   • Discount Calibration Slider   │
                          │   • Duplicate Approval Prevention │
                          └─────────────────┬─────────────────┘
                                            │
                                            ▼
                          ┌───────────────────────────────────┐
                          │     Atomic Database Mutations     │
                          │     & SHA-256 Audit Hash Chain    │
                          │     (Detects Tampering & Deletion)│
                          └───────────────────────────────────┘
```

---

## 🔍 Technical Implementation: What is Genuine Switch vs Custom Python

To ensure strict judging integrity, here is the technical breakdown:

| Capability | Component | Implementation Reality |
| :--- | :--- | :--- |
| **Room Definition** | `switch/room.yaml` | Genuine SandboxAQ Switch room specification for `#revenue-desk`. |
| **Agent Personas** | `switch/agents.yaml` | Genuine declarative agent configurations for `@analyst` and `@reviewer`. |
| **Governance Rules** | `switch/rules.yaml` | Declarative specification of Rules #1–#5. |
| **Protocol Engine** | `src/switch_protocol.py` | Reference Python implementation of the Switch protocol managing room state, event streams, task state machines, and fail-safe disconnect checks. |
| **Chat Platform** | `src/switch_bridge.py` | Matrix/nio connector for Matrix homeservers. The React web cockpit communicates via the internal Switch protocol API endpoints. *(Note: Direct Slack/Teams/Discord connectors require third-party bots and are not bundled locally).* |
| **Orchestration** | `src/workflow.py` | Finite state machine enforcing investigation lifecycle, peer review, and RBAC approvals. |
| **SQL Engine** | `src/database.py` | SQLite database manager with read-only AST keyword validator and cryptographic hash-chain verifier. |

---

## 🏆 Scoring Alignment Against Hackathon Evaluation Criteria

### 1. Use of Switch (30% Weight) — *Switch is Central & Non-Bypassable*
* **Room-Centric Execution**: All interactions must flow through `#revenue-desk`. Both agents publish their findings, SQL queries, and reconciliation status into the shared room timeline.
* **The Switch Disconnection Test**:
  When Switch is disconnected, the entire collaborative engine halts with **`HTTP 503 Switch Unavailable`**. The application does NOT silently execute an independent local bypass.
  * Run the automated test: `python3 -m unittest tests.test_workflow.TestRevenueDeskSuite.test_switch_disconnection_blocks_workflow -v`
  * Test live in UI: Click **"Disconnect"** in the top navigation bar to toggle Switch offline and watch investigations pause with an explicit warning banner.

### 2. Technical Execution (25% Weight) — *Zero Simulated Consensus or Bypass*
* **Read-Only SQL Enforcement**: Blocks destructive statements (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `EXEC`) during analysis.
* **Mathematical Numerical Reconciliation**: Reconciles figures to within `$1.00` numerical tolerance rather than matching substring emoji tokens.
* **Role-Based Access Control (RBAC)**: Only authorized roles (`manager`, `controller`, `vp_finance`) can authorize proposals; requests from unauthorized roles (e.g. `junior_analyst`) fail with `HTTP 403 Forbidden`.
* **Duplicate Approval Prevention**: Prevents duplicate executions on already completed proposals.
* **Proposal Invalidation**: Modifying proposal parameters immediately invalidates prior approvals.
* **Cryptographic Hash-Chaining**: Audit entries are chained using preceding entry signatures (`prev_hash`). Tampering with, deleting, or reordering entries breaks the chain and is detected by `verify_audit_hash_chain()`.
* **Automated Test Suite**: **17/17 tests passing in 2.5s**.

### 3. Creativity & Impact (25% Weight) — *Eliminating Solo-AI Financial Hallucinations*
Ships with 3 reproducible corporate financial benchmarks seeded in SQLite:

1. **Scenario 1: West Region Duplicate Refund Glitch ($20,430 Variance)**
   * *Inquiry*: `"Why did repeat purchases drop in the West region last month?"`
   * *Primary Orders*: 15 transactions totaling **$24,250.00**.
   * *Secondary Refunds*: 8 duplicate refund webhook retries totaling **-$20,430.00**.
   * *Truth*: Net revenue is **$3,820.00** across 7 genuine accounts. Solo AI recommendation of a 25% discount is vetoed, saving **$61,300.00** in annualized margin erosion.
2. **Scenario 2: Subscription Churn vs Expired Card Webhooks ($14,200 Past Due)**
   * *Inquiry*: `"Why did recurring revenue decline this month?"`
   * *Primary Ledger*: 5 accounts flagged inactive with an apparent $18,700 MRR drop.
   * *Secondary Ledger*: 4 accounts (**$14,200.00 MRR**) failed due to expired card tokens (`expired_card`), while only 1 account (**$4,500.00 MRR**) genuinely cancelled.
   * *Action*: Re-routes expired cards to dunning flows instead of issuing unnecessary discount campaigns.
3. **Scenario 3: Payment Gateway Settlement Holds ($4,120 Discrepancy)**
   * *Inquiry*: `"Find differences between recorded sales and payment transactions."`
   * *Ledger Audit*: Billed amount vs settled amount reveals Txn #7 ($2,100 chargeback hold) and Txn #8 ($2,020 FX conversion delay) totaling **$4,120.00** in rolling reserve holds, preventing erroneous write-offs.

### 4. Presentation (20% Weight) — *Enterprise Cockpit (No Overlap)*
Built with React 18 and Node.js following an enterprise light-theme design system (clean white, slate `#F8FAFC`, deep navy `#0F172A`, teal `#0D9488`, emerald `#059669`, and crimson `#DC2626`):
1. **Overview View**: High-level KPIs, Trajectory Chart (Naive AI vs Switch margin preservation), and 3 Scenario Launch Cards.
2. **Investigations View (7-Stage Workspace)**:
   - **Stage 1**: Investigation Created (`INV-XXXXXX`)
   - **Stage 2**: Analyst Agent Working (SQL query box, execution duration, raw rows preview)
   - **Stage 3**: Reviewer Agent Working (independent SQL, secondary ledger cross-check)
   - **Stage 4**: Deterministic Reconciliation Table (Gross, Deductions, Net, and Variance)
   - **Stage 5**: Final Result Status Badge (`VERIFIED` / `DISCREPANCY DETECTED`)
   - **Stage 6**: Business Action Proposal (`PROP-XXXXXX`)
   - **Stage 7**: Human Decision Controls (RBAC role verification, dynamic discount calibration slider 5%–25%, SHA-256 certificate generation)
3. **Switch Room View (`#revenue-desk`)**: Left sidebar (Room Info & Participants), Center feed (real-time message stream), and Right sidebar (Switch Tasks & Decision Lineage).
4. **Approvals View**: Executive sign-off queue with dynamic financial modeling (Protected ARR vs Campaign Cost vs Net Margin Contribution).
5. **Audit History View**: Tamper-evident ledger with timestamps, actors, roles, discount calibrations, and verified SHA-256 hash chains.

---

## 🧪 Automated Test Verification (17 Passing Tests)

Run the full verification suite:

```bash
python3 -m unittest discover tests -v
```

### Complete Test Results:

```text
test_customer_count (test_seed_data.TestSeedData) ... ok
test_naive_vs_correct_west_oct_revenue (test_seed_data.TestSeedData) ... ok
test_refunds_exist_for_october_west (test_seed_data.TestSeedData) ... ok
test_regions_balanced (test_seed_data.TestSeedData) ... ok
test_west_enterprise_customers (test_seed_data.TestSeedData) ... ok
test_west_enterprise_oct_orders_zero (test_seed_data.TestSeedData) ... ok
test_west_enterprise_sept_orders_exist (test_seed_data.TestSeedData) ... ok
test_audit_hash_chain_tamper_detection (test_workflow.TestRevenueDeskSuite) ... ok
test_duplicate_approval_prevention (test_workflow.TestRevenueDeskSuite) ... ok
test_proposal_modification_invalidates_approval (test_workflow.TestRevenueDeskSuite) ... ok
test_read_only_sql_enforcement (test_workflow.TestRevenueDeskSuite) ... ok
test_rejection_logs_decision (test_workflow.TestRevenueDeskSuite) ... ok
test_scenario_1_discrepancy_and_reconciliation (test_workflow.TestRevenueDeskSuite) ... ok
test_scenario_2_churn_vs_payment_failures (test_workflow.TestRevenueDeskSuite) ... ok
test_scenario_3_payment_gateway_reconciliation (test_workflow.TestRevenueDeskSuite) ... ok
test_switch_disconnection_blocks_workflow (test_workflow.TestRevenueDeskSuite) ... ok
test_unauthorized_approval_rejected (test_workflow.TestRevenueDeskSuite) ... ok

----------------------------------------------------------------------
Ran 17 tests in 2.494s

OK
```

---

## 🚀 Quickstart & Reproduction Commands

### Prerequisites
- Python 3.9+
- Node.js 18.0+

### 1. Clone & Install
```bash
git clone https://github.com/Shubhamver45/Revenue-Desk.git
cd Revenue-Desk
npm install
```

### 2. Run Test Suite
```bash
python3 -m unittest discover tests -v
```

### 3. Build & Run Application
```bash
# Build React 18 production bundle
npm run build

# Start the application server
npm start
```
Open **`http://localhost:3000`** in your browser.

*(Alternatively, run the standalone Python backend directly with `python3 app.py` on port 8000).*

---

## ⚠️ Known Limitations & Scope Boundaries

1. **Chat Platform Connectors**: The repository includes the genuine Matrix bot bridge (`src/switch_bridge.py`) which requires Matrix homeserver credentials (`MATRIX_HOMESERVER_URL`). The Slack/Discord/Teams integrations described in general Switch documentation require external bot tokens and are not run locally.
2. **LLM Provider Keys**: If `GROQ_API_KEY` or `GEMINI_API_KEY` are not set in `.env`, the system defaults to the deterministic `mock` provider in `src/llm.py`, which is fully capable of reproducing all 3 financial scenarios locally without network access.
3. **Database Environment**: Runs by default on local SQLite (`data/revenue_desk.db`). Optional Supabase dual-sync is supported if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided.

---

## 👥 Authors & Acknowledgments

- **Shubham Vernekar** ([shubhamvernekar45@gmail.com](mailto:shubhamvernekar45@gmail.com))
- Built with SandboxAQ Switch protocol specifications for the **Flip the Switch Hackathon 2026**.
