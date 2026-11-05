"""Revenue Desk — Multi-provider LLM client with zero-cost fallback.

Supports:
1. Google Gemini (100% Free at https://aistudio.google.com/ - uses standard library urllib)
2. Groq (Free fast inference at https://console.groq.com)
3. Anthropic Claude (Paid)
4. Mock Mode (Zero keys needed! Ideal for instant testing and rehearsing demo)
"""

from __future__ import annotations

import json
import os
import re
import urllib.request
import urllib.error

from src.config import config
from src.database import get_schema_description


def get_active_provider() -> str:
    """Determine which provider to use based on env config."""
    env_provider = os.getenv("LLM_PROVIDER")
    if env_provider:
        return env_provider.lower().strip()
    if config.llm_provider:
        return config.llm_provider
    if os.getenv("OPENAI_API_KEY") or config.openai_api_key:
        return "openai"
    if os.getenv("ANTHROPIC_API_KEY") or config.anthropic_api_key:
        return "anthropic"
    if os.getenv("GROQ_API_KEY") or config.groq_api_key:
        return "groq"
    if os.getenv("GEMINI_API_KEY") or config.gemini_api_key:
        return "gemini"
    return "mock"


def chat_gemini(system_prompt: str, user_message: str) -> str:
    """Call Google Gemini REST API using Python standard library (no pip packages needed)."""
    import ssl
    api_key = config.gemini_api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in your .env file! Get a free key at https://aistudio.google.com/")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # gemini-1.5-flash is universally supported on Google's v1beta endpoints
    models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro"]
    if config.model and config.model not in models_to_try:
        models_to_try.insert(0, config.model)

    last_error = None
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_message}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048
            }
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, context=ctx, timeout=4) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
                return "No text returned from Gemini."
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            last_error = RuntimeError(f"Gemini {model} HTTP {e.code}: {err_body}")
            print(f"[Gemini] Model {model} error: {last_error}")
            if e.code in (401, 403):
                # Policy or auth failure applies to all models for this key/network
                break
            continue
        except Exception as e:
            last_error = e
            break

    raise last_error or RuntimeError("Gemini failed across all attempted models.")


def chat_anthropic(system_prompt: str, user_message: str) -> str:
    """Call Anthropic API if key is available."""
    from anthropic import Anthropic
    client = Anthropic(api_key=config.anthropic_api_key)
    model = config.model or "claude-sonnet-4-20250514"
    res = client.messages.create(
        model=model,
        max_tokens=config.max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return res.content[0].text


def chat_mock(system_prompt: str, user_message: str) -> str:
    """Realistic dynamic simulation for answering diverse user questions with real SQL and findings."""
    prompt_str = (system_prompt + " " + user_message).lower()
    
    # Extract the manager's actual question if embedded in a larger prompt
    q_match = re.search(r'(?:manager ask[eds]*:\s*["\']?|question:\s*)([^\n"\']+)', user_message, re.IGNORECASE)
    user_str = (q_match.group(1).strip() if q_match else user_message).lower()

    # 1. Campaign execution SQL statements
    if "approved the following action" in prompt_str or "generate the sql statements" in prompt_str:
        return """```sql
INSERT INTO campaigns (name, target_segment, target_region, discount_pct, status, created_by, approved_by, details)
VALUES ('West Enterprise Win-Back Campaign', 'enterprise', 'west', 15.0, 'approved', 'Analyst Agent', 'Human Manager', 'Re-engagement outreach with 15% credit');

INSERT INTO campaign_targets (campaign_id, customer_id, message)
VALUES (1, 1, 'Exclusive 15% discount credit applied to your enterprise tier renewal');

INSERT INTO campaign_targets (campaign_id, customer_id, message)
VALUES (1, 2, 'Exclusive 15% discount credit applied to your enterprise tier renewal');

INSERT INTO decision_log (decision, made_by, context)
VALUES ('Approved West Win-Back Campaign with 15% discount', 'Human Manager', 'Resolution for West region October enterprise lapse');
```"""

    # 2. Reviewer verification query generation
    if "generate an independent verification query" in prompt_str:
        if any(w in user_str for w in ["refund", "glitch", "duplicate", "billing", "discrepan"]):
            return """```sql
SELECT r.id, r.order_id, r.amount, r.reason, r.refund_date
FROM refunds r
WHERE r.reason LIKE '%Duplicate%' OR r.amount > 1000
ORDER BY r.amount DESC;
```"""
        elif any(w in user_str for w in ["customer", "account", "client"]):
            return """```sql
SELECT c.id, c.name, c.segment, c.region, COUNT(o.id) as orders_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY c.id ASC LIMIT 10;
```"""
        elif any(w in user_str for w in ["region", "east", "south", "central"]):
            return """```sql
SELECT c.region, COUNT(o.id) as order_count, SUM(o.amount) as revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.region;
```"""
        else:
            return """```sql
SELECT 
    COUNT(o.id) as gross_orders,
    SUM(o.amount) as gross_revenue,
    COUNT(r.id) as refunded_orders,
    COALESCE(SUM(r.amount), 0) as total_refunds,
    SUM(o.amount) - COALESCE(SUM(r.amount), 0) as net_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN refunds r ON o.id = r.order_id
WHERE c.region = 'west' AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31';
```"""

    # 3. Reviewer comparison / verification flow
    if "quality-assurance agent that independently verifies" in prompt_str or "independently verify" in prompt_str or "compare both results" in prompt_str:
        if any(w in user_str for w in ["customer", "account", "client"]):
            return """✅ **Verification Confirmed**
**Independent Audit:** Verified customer account directory against order registry.
- All enterprise account IDs match database master records.
- 0 data integrity anomalies detected in customer segmentation.
- **Status:** Numbers certified with 100% accuracy."""

        elif any(w in user_str for w in ["region", "east", "south", "central"]):
            return """✅ **Regional Integrity Verified**
**Independent Audit:** Regional revenue roll-ups reconciled across all 4 operational territories (West, East, Central, South).
- Transaction checksums match ledger totals.
- Cross-verified gross totals against processor records with zero variance."""

        else:
            return """⚠️ **Discrepancy Found**
**Issue:** The Analyst did not account for product and charge refunds in October.
**Analyst reported:** $24,250 total West October revenue across 12 repeat orders.
**My independent check shows:** **$3,820** net revenue across only **4** valid repeat orders. 
**Root cause:** 8 orders totaling **$20,430** were fully refunded between Oct 15-18 due to a pricing system duplicate charge glitch.

**My query:**
```sql
SELECT 
    COUNT(o.id) as gross_orders,
    SUM(o.amount) as gross_revenue,
    COUNT(r.id) as refunded_orders,
    COALESCE(SUM(r.amount), 0) as total_refunds,
    SUM(o.amount) - COALESCE(SUM(r.amount), 0) as net_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN refunds r ON o.id = r.order_id
WHERE c.region = 'west' AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31';
```

**Recommendation:** Proceed with win-back outreach, but use the verified net figures ($3,820 net revenue). The revenue drop is far more severe (97% decline) than initially estimated."""

    # 4. Propose action flow
    if any(k in prompt_str for k in [
        "propose a concrete business",
        "propose a concrete",
        "propose a business campaign",
        "propose an action"
    ]):
        if any(w in user_str for w in ["customer", "account", "client"]):
            return """📋 **Proposed Action: Dedicated Enterprise Account Management Outreach**

**What:** Direct account executive contact with the isolated enterprise clients.
**Who:** High-value enterprise tier accounts identified in the query.
**Objective:** Schedule Q4 executive reviews to secure contract renewals.
**Expected impact:** Prevent contract attrition and safeguard recurring annual contract value.

⏳ *Awaiting manager approval before execution.*"""

        elif any(w in user_str for w in ["refund", "billing", "glitch", "duplicate"]):
            return """📋 **Proposed Action: Automated Gateway Reconciliation & Credit Note Issuance**

**What:** Reconcile all flagged duplicate refund loops and credit affected client accounts.
**Who:** Accounts impacted by migration duplicate billing.
**Objective:** Restore billing balance and issue official zero-balance confirmation letters.
**Expected impact:** Eliminate customer friction and restore payment processor integrity.

⏳ *Awaiting manager approval before execution.*"""

        else:
            return """📋 **Proposed Action: West Enterprise Win-Back & Glitch Reconciliation Campaign**

**What:** Direct executive outreach with a 15% discount credit and apology note regarding October's pricing glitch.
**Who:** 5 Lapsed Enterprise accounts (Westfield, Pacific Solutions, Golden Gate, Sierra, Redwood) + 8 affected mid-market customers.
**Why:** Enterprise tier churn caused an $84K/month loss, compounded by $20,430 in refunded billing glitches that damaged customer trust.
**Expected impact:** Re-activate 3 of 5 enterprise accounts recovering ~$50K ARR in November.

**Draft details:**
- Outreach Subject: "Account update & apology credit from executive team"
- Offer: 15% renewal incentive and verified account reconciliation

⏳ *Awaiting manager approval before execution.*"""

    # 5. Analyst SQL Generation Phase
    if any(k in prompt_str for k in [
        "write a single executable sqlite query",
        "gather the exact data needed to answer this question",
        "generate a single, clean sqlite query",
        "write a single sqlite query",
        "executable sqlite query"
    ]):
        if any(w in user_str for w in ["refund", "discrepan", "glitch", "loop", "duplicate"]):
            return """```sql
SELECT r.id, r.order_id, c.name as customer_name, r.amount, r.reason, r.refund_date
FROM refunds r
JOIN orders o ON r.order_id = o.id
JOIN customers c ON o.customer_id = c.id
ORDER BY r.amount DESC LIMIT 10;
```"""

        elif any(w in user_str for w in ["region", "east", "south", "central", "territory"]):
            return """```sql
SELECT c.region, COUNT(DISTINCT c.id) as total_customers, COUNT(o.id) as total_orders, SUM(o.amount) as gross_revenue
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.region
ORDER BY gross_revenue DESC;
```"""

        elif any(w in user_str for w in ["top", "order", "highest", "transaction", "sales"]):
            return """```sql
SELECT o.id, c.name as customer_name, c.region, o.amount, o.order_date
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.amount DESC LIMIT 10;
```"""

        elif any(w in user_str for w in ["customer", "account", "client", "who"]):
            if "enterprise" in user_str:
                return """```sql
SELECT c.id, c.name, c.segment, c.region, c.created_at
FROM customers c
WHERE c.segment = 'enterprise'
ORDER BY c.id ASC LIMIT 10;
```"""
            return """```sql
SELECT c.id, c.name, c.segment, c.region, COUNT(o.id) as total_orders
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY total_orders DESC LIMIT 10;
```"""

        else:
            return """```sql
SELECT c.name, c.segment, COUNT(o.id) as order_count, SUM(o.amount) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE c.region = 'west' AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31'
GROUP BY c.id
ORDER BY total_spent DESC;
```"""

    # 6. Analyst Explanation Phase (interpreting real SQLite rows)
    if any(k in prompt_str for k in [
        "analyze these real results",
        "present your findings to the manager",
        "explain the findings",
        "clear summary referencing the exact numbers"
    ]):
        if any(w in user_str for w in ["refund", "discrepan", "glitch", "loop", "duplicate"]):
            return """**Findings:**
Audit of refunds table identified duplicate payment gateway loops:
- Orders #1, #2, and #3 were each refunded **$6,810.00** twice during processor migration.
- Total duplicate loop refunds equal **$20,430.00** across October transactions.
- Legitimate non-duplicate refunds were also logged with specific reasons (e.g. damaged goods).

**Key Insight:**
The recorded drop in revenue was heavily distorted by the $20,430 duplicate refund loop, which masks true operational performance."""

        elif any(w in user_str for w in ["region", "east", "south", "central"]):
            return """**Findings:**
Regional transaction breakdown across all 4 territories:
- **East Region:** Strong performance leading with consistent repeat volume ($41,800).
- **South & Central Regions:** Operating within normal baseline expectations (~$28,100 & ~$18,300).
- **West Region:** Significant discrepancy observed due to October transaction reversals ($24,250 gross).

**Key Insight:**
The performance anomaly is isolated strictly to the West region; East, South, and Central territories remain financially stable."""

        elif any(w in user_str for w in ["customer", "account", "client"]):
            return """**Findings:**
Executed query against customer and account records.
- Found verified enterprise accounts including **Westfield Industries, Pacific Solutions, Golden Gate Corp, Sierra Analytics, and Redwood Partners**.
- All accounts maintain high contract value and belong to the primary enterprise tier.
- Database logs show account records are active with registered regional assignments.

**Key Insight:**
Enterprise accounts are properly registered in the master directory. Targeted communications can be dispatched directly to account leads."""

        else:
            return """**Findings:**
In September 2026, West repeat purchase revenue was $84,680 driven heavily by 5 enterprise accounts (Westfield Industries, Pacific Solutions, Golden Gate Corp, Sierra Analytics, and Redwood Partners). In October 2026, all 5 enterprise accounts logged **0 orders**. Total recorded October West revenue stands at $24,250 across 12 orders.

**Key Insight:**
Repeat purchase drop in West is primarily caused by 100% inactivity in the enterprise tier (5 lapsed high-value clients)."""

    # Default fallback
    return """**Query executed successfully:**
Data returned from transaction database and verified against ledger tables. Reviewer Agent has been notified to cross-verify findings."""


def chat_groq(system_prompt: str, user_message: str) -> str:
    """Call Groq API (100% Free at https://console.groq.com) using standard library urllib."""
    import ssl
    api_key = config.groq_api_key or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in .env! Get a free key at https://console.groq.com")

    model = config.model or "openai/gpt-oss-120b"
    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2,
        "max_tokens": 2048
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    with urllib.request.urlopen(req, context=ctx, timeout=4) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        choices = res_data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
        return "No text returned from Groq."


def chat_openai(system_prompt: str, user_message: str) -> str:
    """Call OpenAI API using standard library urllib."""
    import ssl
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set in .env!")

    model = config.model or os.getenv("LLM_MODEL") or "gpt-4o-mini"
    url = "https://api.openai.com/v1/chat/completions"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2,
        "max_tokens": 2048
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    with urllib.request.urlopen(req, context=ctx, timeout=4) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        choices = res_data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
        return "No text returned from OpenAI."


_failed_providers = set()


def chat(system_prompt: str, user_message: str) -> str:
    """Route chat to configured live provider with automatic resilient fallback."""
    global _failed_providers
    schema = get_schema_description()
    system_prompt_formatted = system_prompt.format(schema=schema)

    provider = get_active_provider()
    
    # Establish priority list
    providers_to_try = [provider]
    for alt in ["groq", "gemini", "openai", "anthropic", "mock"]:
        if alt not in providers_to_try:
            providers_to_try.append(alt)

    # Filter out known failed providers for this session
    active_candidates = [p for p in providers_to_try if p not in _failed_providers]
    if "mock" not in active_candidates:
        active_candidates.append("mock")

    last_error = None
    for p in active_candidates:
        try:
            if p == "gemini" and (config.gemini_api_key or os.getenv("GEMINI_API_KEY")):
                return chat_gemini(system_prompt_formatted, user_message)
            elif p == "groq" and (config.groq_api_key or os.getenv("GROQ_API_KEY")):
                return chat_groq(system_prompt_formatted, user_message)
            elif p == "openai" and (config.openai_api_key or os.getenv("OPENAI_API_KEY")):
                return chat_openai(system_prompt_formatted, user_message)
            elif p == "anthropic" and (config.anthropic_api_key or os.getenv("ANTHROPIC_API_KEY")):
                return chat_anthropic(system_prompt_formatted, user_message)
            elif p == "mock":
                return chat_mock(system_prompt_formatted, user_message)
        except Exception as e:
            print(f"[LLM Warning] Provider '{p}' failed: {e}. Marking offline for this session.")
            _failed_providers.add(p)
            last_error = e

    return chat_mock(system_prompt_formatted, user_message)


def extract_sql_from_response(response: str) -> str | None:
    """Extract SQL code block from text."""
    pattern = r"```sql\s*\n(.*?)```"
    match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    pattern = r"```\s*\n(.*?)```"
    matches = re.findall(pattern, response, re.DOTALL)
    for m in matches:
        if any(kw in m.upper() for kw in ["SELECT", "INSERT", "UPDATE", "DELETE"]):
            return m.strip()
    return None


def extract_multiple_sql(response: str) -> list[str]:
    """Extract all individual SQL statements."""
    sql_block = extract_sql_from_response(response)
    if not sql_block:
        sql_block = response

    statements = [s.strip() for s in sql_block.split(";") if s.strip()]
    return [s for s in statements if any(k in s.upper() for k in ["INSERT", "UPDATE", "DELETE", "CREATE"])]
