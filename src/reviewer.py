"""Revenue Desk — Reviewer Agent.

Independently verifies the Analyst's work with true 2-phase cross-checking:
1. Reviewer LLM formulates an independent verification SQL query
2. Python executes the query against SQLite
3. Reviewer LLM compares the REAL database rows from both queries and flags discrepancies
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from src.llm import chat, extract_sql_from_response
from src.database import run_query
from src.prompts import (
    REVIEWER_SYSTEM,
    REVIEWER_GENERATE_SQL_PROMPT,
    REVIEWER_COMPARE_PROMPT,
)


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
    """The Reviewer agent — independently verifies analyses using real data comparisons."""

    def __init__(self) -> None:
        self.name = "Reviewer"
        self.history: list[ReviewResult] = []

    def verify(
        self,
        analyst_finding: str,
        analyst_sql: str,
        analyst_raw_data: list[dict[str, Any]] | None = None,
        question: str = "Why did repeat purchases drop in the West region last month?",
    ) -> ReviewResult:
        """
        True 2-phase audit:
        Phase 1: Reviewer LLM writes independent verification query.
        Phase 2: Execute query on SQLite and compare real numbers.
        """
        analyst_data = analyst_raw_data or []

        # Phase 1: Ask Reviewer LLM to generate independent verification SQL
        gen_sql_prompt = REVIEWER_GENERATE_SQL_PROMPT.format(
            question=question,
            analyst_sql=analyst_sql,
        )
        sql_response = chat(REVIEWER_SYSTEM, gen_sql_prompt)
        reviewer_sql = extract_sql_from_response(sql_response)

        # Fallback verification query that audits refunds if LLM didn't produce clean SQL
        if not reviewer_sql:
            reviewer_sql = """
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

        # Phase 2: Execute Reviewer SQL on SQLite
        reviewer_data: list[dict[str, Any]] = []
        try:
            reviewer_data = run_query(reviewer_sql)
        except Exception:
            # Safe refund audit query
            reviewer_sql = """
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
            reviewer_data = run_query(reviewer_sql)

        # Phase 3: Compare real numbers from both query executions
        compare_prompt = REVIEWER_COMPARE_PROMPT.format(
            analyst_sql=analyst_sql,
            analyst_row_count=len(analyst_data),
            analyst_data_json=json.dumps(analyst_data[:10], indent=2, default=str),
            analyst_findings=analyst_finding,
            reviewer_sql=reviewer_sql,
            reviewer_row_count=len(reviewer_data),
            reviewer_data_json=json.dumps(reviewer_data[:10], indent=2, default=str),
        )
        comparison_response = chat(REVIEWER_SYSTEM, compare_prompt)

        # Discrepancy detection based on content
        is_verified = (
            "✅" in comparison_response
            and "discrepancy" not in comparison_response.lower()
            and "⚠️" not in comparison_response
        )

        result = ReviewResult(
            analyst_finding=analyst_finding,
            analyst_sql=analyst_sql,
            reviewer_sql=reviewer_sql,
            reviewer_data=reviewer_data,
            llm_response=comparison_response,
            is_verified=is_verified,
        )

        self.history.append(result)
        return result


# Singleton for convenience
reviewer_agent = ReviewerAgent()
