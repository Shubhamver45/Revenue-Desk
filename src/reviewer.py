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
            except Exception as e:
                response += f"\n\n⚠️ Reviewer query error: {e}"

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

