"""Unit and Integration Tests for Revenue Desk Workflow (Standard library unittest)."""

import os
import sys
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.database import init_database, run_query, run_write
from src.workflow import RevenueDesk, WorkflowState
from scripts.export_report import generate_html_report

TEST_DB = "/tmp/test_revenue_workflow.db"


class TestRevenueDeskWorkflow(unittest.TestCase):

    def setUp(self):
        os.environ["DB_PATH"] = TEST_DB
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
        init_database(TEST_DB)

    def tearDown(self):
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)

    def test_workflow_state_transition(self):
        """Verify that asking a question moves workflow into AWAITING_APPROVAL."""
        desk = RevenueDesk()
        ctx = desk.ask("Why did repeat purchases drop in the West region last month?")
        
        self.assertEqual(ctx.state, WorkflowState.AWAITING_APPROVAL)
        self.assertIsNotNone(ctx.analysis)
        self.assertIsNotNone(ctx.review)
        self.assertIsNotNone(ctx.proposed_action)

    def test_workflow_rejection(self):
        """Verify that human rejection terminates workflow and logs decision."""
        desk = RevenueDesk()
        desk.ask("Why did repeat purchases drop in the West region last month?")
        
        msg = desk.approve("Rejected: Not aligned with current Q4 strategy.")
        self.assertIn("rejected", msg.lower())
        self.assertEqual(desk.current.state, WorkflowState.COMPLETE)

        # Verify rejection is recorded in decision_log
        logged = run_query("SELECT * FROM decision_log WHERE decision LIKE '%REJECTED%'", db_path=TEST_DB)
        self.assertGreaterEqual(len(logged), 1)
        self.assertIn("Not aligned", logged[0]["decision"])

    def test_workflow_approval_and_execution(self):
        """Verify that human approval executes database insertions and completes task."""
        desk = RevenueDesk()
        desk.ask("Why did repeat purchases drop in the West region last month?")
        
        res = desk.approve("Approved. Change discount from 10% to 15%.")
        self.assertTrue("Campaign Executed" in res or "complete" in res.lower())
        self.assertEqual(desk.current.state, WorkflowState.COMPLETE)

        # Verify campaign record created
        campaigns = run_query("SELECT * FROM campaigns", db_path=TEST_DB)
        self.assertGreaterEqual(len(campaigns), 1)
        self.assertEqual(campaigns[0]["status"], "approved")

        # Verify decision logged
        decisions = run_query("SELECT * FROM decision_log", db_path=TEST_DB)
        self.assertGreaterEqual(len(decisions), 1)

    def test_html_report_generation(self):
        """Verify executive report generation runs and produces HTML."""
        out_file = "/tmp/test_report.html"
        res_path = generate_html_report(out_file)
        self.assertTrue(os.path.exists(res_path))
        content = Path(res_path).read_text(encoding="utf-8")
        self.assertIn("Revenue Desk", content)
        self.assertIn("Room Participants", content)
        os.remove(out_file)


if __name__ == "__main__":
    unittest.main()
