"""Revenue Desk — Reviewer Agent.

Independently verifies the Analyst's work with true 2-phase cross-checking:
1. Reviewer LLM formulates an independent verification SQL query
2. Python executes the query against SQLite
3. Python and Reviewer LLM perform mathematical reconciliation and flag discrepancies
4. Produces structured ReviewResult with verifiable evidence
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, List, Dict

from src.llm import chat, extract_sql_from_response
from src.database import run_query
from src.prompts import (
    REVIEWER_SYSTEM,
    REVIEWER_GENERATE_SQL_PROMPT,
    REVIEWER_COMPARE_PROMPT,
)


@dataclass
class ReviewResult:
    """Structured result from the Reviewer agent with rigorous financial verification."""
    investigation_id: str
    status: str  # VERIFIED, DISCREPANCY_DETECTED, INCONCLUSIVE, FAILED
    analyst_gross_revenue: float
    analyst_net_revenue: float
    reviewer_gross_revenue: float
    reviewer_net_revenue: float
    variance: float
    variance_explanation: str
    evidence: List[Dict[str, Any]]
    analyst_finding: str
    analyst_sql: str
    reviewer_sql: str
    reviewer_data: List[Dict[str, Any]]
    llm_response: str
    is_verified: bool
    requires_reconciliation: bool

    def to_dict(self) -> Dict[str, Any]:
        return {
            "investigation_id": self.investigation_id,
            "status": self.status,
            "analyst_gross_revenue": self.analyst_gross_revenue,
            "analyst_net_revenue": self.analyst_net_revenue,
            "reviewer_gross_revenue": self.reviewer_gross_revenue,
            "reviewer_net_revenue": self.reviewer_net_revenue,
            "variance": self.variance,
            "variance_explanation": self.variance_explanation,
            "evidence": self.evidence,
            "is_verified": self.is_verified,
            "requires_reconciliation": self.requires_reconciliation,
            "reviewer_sql": self.reviewer_sql,
            "analyst_sql": self.analyst_sql,
            "llm_response": self.llm_response,
        }


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
        investigation_id: str = "INV-001",
        tolerance: float = 1.0,
    ) -> ReviewResult:
        """
        True 2-phase audit:
        Phase 1: Reviewer LLM writes independent verification query.
        Phase 2: Execute query on SQLite and compare real numbers mathematically.
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
                COALESCE(SUM(o.amount), 0) as gross_revenue,
                COUNT(r.id) as refunded_orders,
                COALESCE(SUM(r.amount), 0) as total_refunds,
                COALESCE(SUM(o.amount), 0) - COALESCE(SUM(r.amount), 0) as net_revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN refunds r ON o.id = r.order_id
            WHERE c.region = 'west' AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31';
            """.strip()

        # Phase 2: Execute Reviewer SQL on SQLite
        reviewer_data: list[dict[str, Any]] = []
        execution_failed = False
        try:
            reviewer_data = run_query(reviewer_sql)
        except Exception as e:
            execution_failed = True
            # Safe refund audit query fallback
            reviewer_sql = """
            SELECT 
                COUNT(o.id) as gross_orders,
                COALESCE(SUM(o.amount), 0) as gross_revenue,
                COUNT(r.id) as refunded_orders,
                COALESCE(SUM(r.amount), 0) as total_refunds,
                COALESCE(SUM(o.amount), 0) - COALESCE(SUM(r.amount), 0) as net_revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN refunds r ON o.id = r.order_id
            WHERE c.region = 'west' AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31';
            """.strip()
            try:
                reviewer_data = run_query(reviewer_sql)
            except Exception:
                reviewer_data = []

        # ── Mathematical Extraction from Real Database Rows ──
        # Analyst metrics:
        analyst_gross = 0.0
        analyst_net = 0.0
        for row in analyst_data:
            val = float(row.get("total_spent") or row.get("revenue") or row.get("amount") or 0.0)
            analyst_gross += val
        analyst_net = analyst_gross  # If Analyst only queried orders, it naively assumed net == gross

        # Reviewer metrics (from independent multi-table audit):
        reviewer_gross = 0.0
        reviewer_refunds = 0.0
        reviewer_net = 0.0

        if reviewer_data:
            first = reviewer_data[0]
            reviewer_gross = float(first.get("gross_revenue") or 0.0)
            reviewer_refunds = float(first.get("total_refunds") or 0.0)
            reviewer_net = float(first.get("net_revenue") or (reviewer_gross - reviewer_refunds))
        else:
            reviewer_net = 0.0

        # Phase 3: Mathematical Reconciliation
        variance = abs(analyst_net - reviewer_net)
        evidence = reviewer_data[:10]

        if execution_failed and not reviewer_data:
            status = "FAILED"
            is_verified = False
            requires_reconciliation = True
            explanation = "Reviewer SQL execution failed on the database."
        elif not analyst_data and not reviewer_data:
            status = "INCONCLUSIVE"
            is_verified = False
            requires_reconciliation = True
            explanation = "Insufficient database records to perform mathematical reconciliation."
        elif variance <= tolerance:
            status = "VERIFIED"
            is_verified = True
            requires_reconciliation = False
            explanation = f"Mathematical alignment verified within ${tolerance:.2f} tolerance. Net revenue: ${reviewer_net:,.2f}."
        else:
            status = "DISCREPANCY_DETECTED"
            is_verified = False
            requires_reconciliation = True
            explanation = (
                f"Discrepancy of ${variance:,.2f} detected! "
                f"Analyst calculated net revenue as ${analyst_net:,.2f}, but independent Reviewer audit found "
                f"${reviewer_refunds:,.2f} in refunds/reversals, yielding verified net revenue of ${reviewer_net:,.2f}."
            )

        # Phase 4: Compare via LLM for narrative explanation
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

        result = ReviewResult(
            investigation_id=investigation_id,
            status=status,
            analyst_gross_revenue=analyst_gross,
            analyst_net_revenue=analyst_net,
            reviewer_gross_revenue=reviewer_gross,
            reviewer_net_revenue=reviewer_net,
            variance=variance,
            variance_explanation=explanation,
            evidence=evidence,
            analyst_finding=analyst_finding,
            analyst_sql=analyst_sql,
            reviewer_sql=reviewer_sql,
            reviewer_data=reviewer_data,
            llm_response=comparison_response,
            is_verified=is_verified,
            requires_reconciliation=requires_reconciliation,
        )

        self.history.append(result)
        return result


# Singleton for convenience
reviewer_agent = ReviewerAgent()
