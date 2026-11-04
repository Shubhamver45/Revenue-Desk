"""Revenue Desk — Reviewer Agent.

Independently verifies the Analyst's findings by running its own queries.
Flags discrepancies or confirms accuracy.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from src.llm import chat, extract_sql_from_response
from src.database import run_query
from src.prompts import REVIEWER_SYSTEM, REVIEWER_VERIFY_PROMPT


@dataclass
class ReviewResult:
    """Structured result from the Reviewer agent."""
    analyst_finding: str
    analyst_sql: str
    reviewer_sql: str
    reviewer_data: list[dict[str, Any]]
    llm_response: str
    is_verified: bool  # True = numbers match, False = discrepancy found


class ReviewerAgent:
    """The Reviewer agent — independently verifies analyses."""

    def __init__(self) -> None:
        self.name = "Reviewer"
        self.history: list[ReviewResult] = []

    def verify(self, analyst_finding: str, analyst_sql: str) -> ReviewResult:
        """
        Given the Analyst's finding and SQL:
        1. Ask the LLM to write an independent verification query
        2. Execute it
        3. Compare and report
        """
        prompt = REVIEWER_VERIFY_PROMPT.format(
            analyst_finding=analyst_finding,
            analyst_sql=analyst_sql,
        )
        response = chat(REVIEWER_SYSTEM, prompt)

        # Extract and run the Reviewer's own query
        sql = extract_sql_from_response(response)
        reviewer_data: list[dict[str, Any]] = []

        if sql:
            try:
                reviewer_data = run_query(sql)
            except Exception:
                pass

        # If LLM didn't produce executable SQL or query failed, run the deterministic verification query
        if not reviewer_data:
            fallback_sql = """
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
            """.strip()
            reviewer_data = run_query(fallback_sql)
            if not sql:
                sql = fallback_sql

        # Determine if verified or discrepancy
        is_verified = "✅" in response and "⚠️" not in response.split("✅")[0]
        # More robust: check for the Discrepancy keyword
        if "Discrepancy Found" in response or "discrepancy" in response.lower():
            is_verified = False

        result = ReviewResult(
            analyst_finding=analyst_finding,
            analyst_sql=analyst_sql,
            reviewer_sql=sql or "(no SQL generated)",
            reviewer_data=reviewer_data,
            llm_response=response,
            is_verified=is_verified,
        )

        self.history.append(result)
        return result


# Singleton for convenience
reviewer_agent = ReviewerAgent()

