"""Revenue Desk — Analyst Agent.

Receives business questions, queries the database, presents findings,
and proposes actionable campaigns.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from src.llm import chat, extract_sql_from_response
from src.database import run_query
from src.prompts import (
    ANALYST_SYSTEM,
    ANALYST_QUERY_PROMPT,
    ANALYST_PROPOSE_ACTION,
)


@dataclass
class AnalysisResult:
    """Structured result from the Analyst agent."""
    question: str
    sql_query: str
    raw_data: list[dict[str, Any]]
    llm_response: str
    proposed_action: str | None = None


class AnalystAgent:
    """The Analyst agent — answers business questions with data."""

    def __init__(self) -> None:
        self.name = "Analyst"
        self.history: list[AnalysisResult] = []

    def analyze(self, question: str) -> AnalysisResult:
        """
        Given a manager's question:
        1. Ask the LLM to write a SQL query
        2. Execute the query
        3. Feed results back to the LLM for interpretation
        4. Return structured result
        """
        # Step 1: Get SQL query and initial analysis from LLM
        prompt = ANALYST_QUERY_PROMPT.format(question=question)
        response = chat(ANALYST_SYSTEM, prompt)

        # Step 2: Extract and execute the SQL query
        sql = extract_sql_from_response(response)
        raw_data: list[dict[str, Any]] = []

        if sql:
            try:
                raw_data = run_query(sql)
            except Exception as e:
                response += f"\n\n⚠️ Query execution error: {e}"

        result = AnalysisResult(
            question=question,
            sql_query=sql or "(no SQL generated)",
            raw_data=raw_data,
            llm_response=response,
        )

        self.history.append(result)
        return result

    def propose_action(self, analysis: AnalysisResult) -> str:
        """Generate an action proposal based on the analysis."""
        prompt = ANALYST_PROPOSE_ACTION.format(analysis=analysis.llm_response)
        action = chat(ANALYST_SYSTEM, prompt)
        analysis.proposed_action = action
        return action

    def execute_campaign(
        self,
        action: str,
        approval: str,
        modifications: str = "None",
    ) -> str:
        """
        Execute an approved campaign — writes to the database.
        Returns a confirmation message.
        """
        from src.database import run_write

        from src.prompts import CAMPAIGN_EXECUTION_PROMPT
        from src.llm import extract_multiple_sql

        prompt = CAMPAIGN_EXECUTION_PROMPT.format(
            action=action,
            approval=approval,
            modifications=modifications,
        )
        response = chat(ANALYST_SYSTEM, prompt)
        statements = extract_multiple_sql(response)

        executed = 0
        errors = []
        for stmt in statements:
            try:
                run_write(stmt)
                executed += 1
            except Exception as e:
                errors.append(f"  - `{stmt[:60]}...` → {e}")

        result_parts = [f"✅ **Campaign Executed** — {executed} database operations completed."]
        if errors:
            result_parts.append("⚠️ Some statements had issues:")
            result_parts.extend(errors)

        result_parts.append("\n📝 Decision logged. Task complete.")
        return "\n".join(result_parts)


# Singleton for convenience
analyst_agent = AnalystAgent()

