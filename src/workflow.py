"""Revenue Desk — Workflow Orchestrator.

Manages the full lifecycle:
  Question → Analysis → Verification → Proposal → Approval → Execution
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Any, Callable

from src.analyst import analyst_agent, AnalysisResult
from src.reviewer import reviewer_agent, ReviewResult
from src.database import run_write
from src.prompts import APPROVAL_PROMPT


class WorkflowState(Enum):
    IDLE = auto()
    ANALYZING = auto()
    REVIEWING = auto()
    PROPOSING = auto()
    AWAITING_APPROVAL = auto()
    EXECUTING = auto()
    COMPLETE = auto()
    ERROR = auto()


@dataclass
class WorkflowContext:
    """Full context of a single workflow run."""
    question: str
    state: WorkflowState = WorkflowState.IDLE
    analysis: AnalysisResult | None = None
    review: ReviewResult | None = None
    proposed_action: str | None = None
    approval_response: str | None = None
    execution_result: str | None = None
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: datetime | None = None
    messages: list[dict[str, str]] = field(default_factory=list)

    def add_message(self, sender: str, content: str) -> None:
        self.messages.append({
            "sender": sender,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })


class RevenueDesk:
    """
    The Revenue Desk workflow orchestrator.

    This is the central state machine that coordinates:
    1. Analyst receives question and analyzes data
    2. Reviewer independently verifies
    3. Analyst proposes action
    4. Human manager approves/rejects
    5. Analyst executes approved action
    """

    def __init__(self, on_message: Callable[[str, str], None] | None = None) -> None:
        """
        Args:
            on_message: Callback (sender, message) for posting to the room.
                        If None, messages are stored but not posted.
        """
        self.current: WorkflowContext | None = None
        self.history: list[WorkflowContext] = []
        self._on_message = on_message or (lambda s, m: None)

    def _post(self, sender: str, message: str) -> None:
        """Post a message to the room and record it."""
        if self.current:
            self.current.add_message(sender, message)
        self._on_message(sender, message)

    # ── Step 1: Receive question ────────────────────────────────────

    def ask(self, question: str) -> WorkflowContext:
        """Start a new workflow from a manager's question."""
        self.current = WorkflowContext(question=question, state=WorkflowState.ANALYZING)
        self._post("Manager", question)
        self._post("System", "📊 Routing question to Analyst Agent...")

        # Run analysis
        analysis = analyst_agent.analyze(question)
        self.current.analysis = analysis
        self._post("Analyst", analysis.llm_response)

        # Automatically trigger review
        self.current.state = WorkflowState.REVIEWING
        self._post("System", "🔍 Reviewer Agent is independently verifying...")

        review = reviewer_agent.verify(analysis.llm_response, analysis.sql_query)
        self.current.review = review
        self._post("Reviewer", review.llm_response)

        # Propose action
        self.current.state = WorkflowState.PROPOSING
        if review.is_verified:
            self._post("System", "✅ Numbers verified. Analyst is preparing a proposed action...")
        else:
            self._post("System", "⚠️ Discrepancy detected! Analyst should revise analysis. Proceeding with Reviewer's corrected data...")

        action = analyst_agent.propose_action(analysis)
        self.current.proposed_action = action
        self._post("Analyst", action)

        # Request approval
        self.current.state = WorkflowState.AWAITING_APPROVAL
        approval_msg = APPROVAL_PROMPT.format(
            action_summary=action[:200] + "..." if len(action) > 200 else action,
            reviewer_status="✅ Verified" if review.is_verified else "⚠️ Discrepancy flagged — review carefully",
        )
        self._post("System", approval_msg)

        return self.current

    # ── Step 2: Receive approval ────────────────────────────────────

    def approve(self, response: str) -> str:
        """Process manager's approval/rejection response."""
        if not self.current or self.current.state != WorkflowState.AWAITING_APPROVAL:
            return "⚠️ No action is currently awaiting approval."

        self.current.approval_response = response
        self._post("Manager", response)

        response_lower = response.lower().strip()

        # Parse response
        if response_lower.startswith("rejected") or response_lower.startswith("reject"):
            self.current.state = WorkflowState.COMPLETE
            self.current.completed_at = datetime.now()

            # Log the rejection
            run_write(
                "INSERT INTO decision_log (decision, made_by, context) VALUES (?, ?, ?)",
                (f"REJECTED: {response}", "Manager", self.current.question),
            )

            msg = "❌ **Action rejected.** Decision logged."
            self._post("System", msg)
            self.history.append(self.current)
            return msg

        # Approved (with or without modifications)
        self.current.state = WorkflowState.EXECUTING
        modifications = "None"
        if "with changes:" in response_lower or "change" in response_lower:
            modifications = response

        self._post("System", "⚙️ Executing approved action...")

        result = analyst_agent.execute_campaign(
            action=self.current.proposed_action or "",
            approval=response,
            modifications=modifications,
        )
        self.current.execution_result = result
        self.current.state = WorkflowState.COMPLETE
        self.current.completed_at = datetime.now()

        self._post("Analyst", result)
        self.history.append(self.current)

        return result

    # ── Utilities ───────────────────────────────────────────────────

    def get_status(self) -> str:
        """Return the current workflow status."""
        if not self.current:
            return "💤 Revenue Desk is idle. Ask a question to begin."
        return f"State: {self.current.state.name} | Question: {self.current.question[:80]}"

    def get_history_summary(self) -> str:
        """Return a summary of past workflows."""
        if not self.history:
            return "No completed workflows yet."

        lines = ["📜 **Workflow History:**"]
        for i, ctx in enumerate(self.history, 1):
            status = "✅" if ctx.state == WorkflowState.COMPLETE else "❌"
            lines.append(
                f"{i}. {status} [{ctx.started_at.strftime('%Y-%m-%d %H:%M')}] "
                f"Q: {ctx.question[:60]}..."
            )
        return "\n".join(lines)

