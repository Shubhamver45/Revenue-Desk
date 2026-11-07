# Revenue Desk

**A multi-agent revenue analysis workflow with independent review and human approval.**

Revenue Desk helps a sales or operations manager investigate questions about revenue, orders, refunds, and customer activity. An Analyst agent investigates the question, a Reviewer agent independently checks the findings, and a human manager decides whether a proposed action should proceed.

> Built for the Flip the Switch Hackathon (November 2026).

## How Switch is used

Revenue Desk is designed around a shared Switch room named **`#revenue-desk`**. The room brings the human manager and two separately identified agents into the same conversation:

- **Analyst (`@analyst`)** — turns a business question into SQL, executes the query against the Revenue Desk SQLite database, interprets the returned rows, and proposes a possible action.
- **Reviewer (`@reviewer`)** — independently generates and runs a verification query, checks the Analyst's findings for issues such as refunds, cancellations, date boundaries, and segment mismatches, and reports whether it found a discrepancy.
- **Manager (human)** — asks questions, reviews both agents' messages, and explicitly approves or rejects a proposed action.

The agent roles and room expectations are documented in:

- `switch/room.yaml` — room name, participants, features, and collaboration rules.
- `switch/agents.yaml` — Analyst and Reviewer roles, instructions, tools, and guardrails.
- `switch/revenue-desk.template.yaml` — an import-oriented room and agent template.

### Room connection

The Python integration in `src/switch_bridge.py` uses `matrix-nio` to connect two Matrix bot accounts to the configured room. The bridge:

1. Logs in the Analyst and Reviewer bot accounts.
2. Joins both accounts to the configured room.
3. Listens for text messages in that room.
4. Passes human questions to the `RevenueDesk` workflow orchestrator.
5. Posts Analyst, Reviewer, and System messages back to the room using the corresponding bot account.
6. Treats a manager's reply as an approval response when the workflow is waiting for approval.

The current repository implements this Matrix-compatible bridge. It does **not** include a completed Slack, Microsoft Teams, Discord, or Telegram connector. The React web cockpit is a separate interface for the same Revenue Desk application; it should not be described as one of those chat-platform integrations.

### Workflow

```text
Manager asks a question in #revenue-desk
                 |
                 v
           Analyst agent
       generates and runs SQL
                 |
                 v
          Reviewer agent
     independently checks data
                 |
                 v
      Findings / discrepancy
                 |
                 v
       Proposed business action
                 |
                 v
       AWAITING_APPROVAL
                 |
          Manager decides
            /       \
        Reject      Approve
          |            |
     Log decision   Execute action
                       |
                       v
                 Record outcome
```

The workflow state machine is implemented in `src/workflow.py`. The approval step is handled by the application workflow: the bridge routes the manager's next room message to the approval handler while the workflow is in `AWAITING_APPROVAL`.

## Agent and model configuration

The agents are custom Python implementations, not LangChain, Claude Code, Codex, or Google ADK agents:

- `src/analyst.py` implements the Analyst.
- `src/reviewer.py` implements the Reviewer.
- `src/workflow.py` coordinates the two agents and the approval lifecycle.
- `src/llm.py` provides the model-provider client.

The LLM client supports `gemini`, `groq`, `anthropic`, `openai`, and `mock` provider modes. The active provider is selected through `LLM_PROVIDER` and the corresponding API key. The YAML agent definition currently names Claude Sonnet as the model for both roles; the runtime Python client selects its provider from environment configuration. Configure the provider you intend to use rather than assuming that a provider named in a YAML template is automatically active in every run.

## Requirements

- Python 3.11 or newer
- Node.js 18 or newer (for the web application)
- A Matrix-compatible homeserver and two bot accounts if you want to run the room bridge
- An API key for the LLM provider you choose, or `mock` mode for local testing

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/Shubhamver45/Revenue-Desk.git
cd Revenue-Desk
```

### 2. Create a virtual environment and install Python dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`. For a local run without an external model API key, keep mock mode enabled:

```dotenv
LLM_PROVIDER=mock
DB_PATH=data/revenue_desk.db
```

To use a live model provider, set `LLM_PROVIDER` to `gemini`, `groq`, `anthropic`, or `openai`, and provide the matching key (`GEMINI_API_KEY`, `GROQ_API_KEY`, `ANTHROPIC_API_KEY`, or `OPENAI_API_KEY`). Do not commit `.env` or API credentials to source control.

### 4. Run the web application

The Node server starts the web frontend and its Python backend:

```bash
npm install
npm start
```

Open **http://localhost:3000**.

Alternatively, run the Python web application directly:

```bash
python3 app.py
```

The Python application defaults to **http://localhost:5050**. You can change its port with `PORT`.

### 5. Run the terminal demo

```bash
python3 main.py
```

The default mode is `cli`. Ask a revenue question in the terminal and follow the Analyst, Reviewer, and approval steps. Mock mode is useful for trying the workflow without a live LLM API key.

## Run the Switch room bridge

The bridge requires a reachable Matrix-compatible homeserver, a room the bot accounts can join, and credentials for both bot accounts. Add the following values to `.env`:

```dotenv
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key

SWITCH_HOMESERVER=https://your-matrix-homeserver
SWITCH_ROOM_ID=!your-room-id:your-homeserver

ANALYST_USER_ID=@analyst:your-homeserver
ANALYST_PASSWORD=your-analyst-bot-password

REVIEWER_USER_ID=@reviewer:your-homeserver
REVIEWER_PASSWORD=your-reviewer-bot-password
```

Use the actual homeserver URL, room ID, Matrix user IDs, and passwords issued by your environment. The example values above are placeholders, not working credentials.

Start the bridge:

```bash
MODE=bridge python3 main.py
```

Both bot accounts must be permitted to log in and join the room. A human manager can then post a question in `#revenue-desk`. The bridge listens for room text messages and routes questions and approval replies into the workflow.

**Note:** `switch/room.yaml`, `switch/agents.yaml`, and `switch/revenue-desk.template.yaml` document the intended room and agent configuration. The Python bridge itself reads its connection details from environment variables in `.env`; it does not automatically provision a hosted Switch workspace by parsing those YAML files.

## Tests

Run the project's unit tests with:

```bash
python3 -m unittest discover tests -v
```

## Repository layout

```text
Revenue-Desk/
├── app.py                      # Python web application
├── main.py                     # CLI and Matrix bridge entry point
├── server.js                   # Node.js web server / backend proxy
├── src/
│   ├── analyst.py              # Analyst agent
│   ├── reviewer.py             # Reviewer agent
│   ├── workflow.py             # Analysis, review, approval orchestration
│   ├── switch_bridge.py        # Matrix room bridge
│   ├── llm.py                  # Multi-provider LLM client
│   ├── database.py             # SQLite access and initialization
│   └── config.py               # Environment configuration
├── switch/
│   ├── room.yaml               # Room and participant specification
│   ├── agents.yaml             # Agent roles and instructions
│   └── revenue-desk.template.yaml
├── tests/                      # Unit tests
├── data/                       # Local database and demo data
├── .env.example                # Environment variable template
└── README.md
```

## Current scope and limitations

Revenue Desk is a hackathon prototype intended to demonstrate a multi-agent verification and approval workflow. The included room bridge uses the Matrix protocol. The repository does not currently provide native Slack, Teams, Discord, or Telegram integrations. The project should be tested with non-production data; it is not a production financial control system.

## Links

- **Source code:** https://github.com/Shubhamver45/Revenue-Desk
- **Live web application:** https://revenue-desk-gamma.vercel.app

---

Built by Shubham Vernekar for the Flip the Switch Hackathon 2026.
