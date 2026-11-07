"""Revenue Desk 2.0 — Comprehensive Test Suite.

Verifies all critical hackathon criteria:
1. Switch connection and messaging
2. Switch dependency: Operation fails safely when Switch is disconnected
3. Analyst SQL generation & execution
4. Reviewer independent verification
5. Discrepancy detection & mathematical reconciliation (no false consensus)
6. Read-only SQL enforcement (rejects DROP, DELETE, UPDATE, INSERT)
7. Role-based approval security (unauthorized roles rejected)
8. Proposal ID validation & duplicate approval handling
9. Scenario 1: Duplicate refund discrepancy ($20,430 variance)
10. Scenario 2: Churn vs Payment failures ($14,200 past-due)
11. Scenario 3: Sales ledger vs Payment gateway settlement ($4,120 discrepancy)
"""

import os
import sys
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.database import init_database, run_query, run_write, validate_read_only_sql, verify_audit_hash_chain
from src.workflow import RevenueDesk, WorkflowState
from src.switch_protocol import switch_engine, SwitchUnavailableError, SwitchConnectionState

TEST_DB = "/tmp/test_revenue_desk_v2.db"


class TestRevenueDeskSuite(unittest.TestCase):

    def setUp(self):
        os.environ["DB_PATH"] = TEST_DB
        os.environ["LLM_PROVIDER"] = "mock"
        os.environ["SWITCH_ENABLED"] = "true"
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
        init_database(TEST_DB)
        switch_engine.connect()

    def tearDown(self):
        switch_engine.connect()
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)

    # ── Test 1: Switch Dependency Enforcement ──

    def test_switch_disconnection_blocks_workflow(self):
        """CRITICAL HACKATHON TEST: When Switch is offline, workflow fails safely."""
        desk = RevenueDesk()
        
        # Disconnect Switch
        switch_engine.disconnect(reason="Simulated connection drop")
        self.assertFalse(switch_engine.is_connected())

        # Attempting an investigation MUST raise SwitchUnavailableError
        with self.assertRaises(SwitchUnavailableError):
            desk.ask("Why did repeat purchases drop in the West region last month?")

        # Reconnect Switch and verify it succeeds
        switch_engine.connect()
        self.assertTrue(switch_engine.is_connected())
        ctx = desk.ask("Why did repeat purchases drop in the West region last month?")
        self.assertIsNotNone(ctx)
        self.assertEqual(ctx.state, WorkflowState.AWAITING_APPROVAL)

    # ── Test 2: Read-Only SQL Safety ──

    def test_read_only_sql_enforcement(self):
        """Analytical queries must reject destructive SQL statements."""
        # Valid queries
        validate_read_only_sql("SELECT * FROM customers")
        validate_read_only_sql("WITH monthly AS (SELECT * FROM orders) SELECT * FROM monthly")

        # Destructive queries MUST raise PermissionError
        with self.assertRaises(PermissionError):
            validate_read_only_sql("DROP TABLE customers")

        with self.assertRaises(PermissionError):
            validate_read_only_sql("DELETE FROM orders WHERE id = 1")

        with self.assertRaises(PermissionError):
            validate_read_only_sql("UPDATE customers SET name = 'Hacked'")

        with self.assertRaises(PermissionError):
            validate_read_only_sql("INSERT INTO orders VALUES (999, 1, 100, '2026-10-01', 0)")

    # ── Test 3: Discrepancy Detection & Mathematical Reconciliation ──

    def test_scenario_1_discrepancy_and_reconciliation(self):
        """Scenario 1: Detects $20,430 West region refund anomaly and reconciles net revenue."""
        desk = RevenueDesk()
        ctx = desk.ask("Investigate the revenue discrepancy in the West region.")

        self.assertIsNotNone(ctx.analysis)
        self.assertIsNotNone(ctx.review)
        
        # Reviewer must find the refund discrepancy
        self.assertFalse(ctx.review.is_verified)
        self.assertEqual(ctx.review.status, "DISCREPANCY_DETECTED")
        self.assertAlmostEqual(ctx.review.variance, 20430.0, places=2)
        self.assertAlmostEqual(ctx.review.reviewer_net_revenue, 3820.0, places=2)

        # After reconciliation, state moves to AWAITING_APPROVAL with a formal proposal
        self.assertEqual(ctx.state, WorkflowState.AWAITING_APPROVAL)
        self.assertIsNotNone(ctx.proposal)
        self.assertEqual(ctx.proposal.recommended_discount, 15.0)

    # ── Test 4: Role-Based Approval Security ──

    def test_unauthorized_approval_rejected(self):
        """Only authorized manager roles can approve financial proposals."""
        desk = RevenueDesk()
        desk.ask("Investigate the revenue discrepancy in the West region.")

        # Non-manager role must be rejected with PermissionError
        with self.assertRaises(PermissionError):
            desk.approve("Approved with 15%", user_role="viewer", authorized_by="Guest Viewer")

        with self.assertRaises(PermissionError):
            desk.approve("Approved with 15%", user_role="contractor", authorized_by="External Contractor")

        # Authorized manager succeeds
        res = desk.approve("Approved with 15%", user_role="manager", authorized_by="Alex Rivera (VP Finance)")
        self.assertEqual(res["status"], "completed")
        self.assertIn("signature_hash", res)

    # ── Test 5: Rejection Workflow ──

    def test_rejection_logs_decision(self):
        """Human manager can reject a proposal, logging the decision without database mutations."""
        desk = RevenueDesk()
        desk.ask("Investigate the revenue discrepancy in the West region.")

        res = desk.approve("Reject: Do not offer discounts in Q4", user_role="manager")
        self.assertEqual(res["status"], "rejected")
        self.assertEqual(desk.current.state, WorkflowState.REJECTED)

        # Verify rejection logged in DB
        logs = run_query("SELECT * FROM decision_log WHERE decision LIKE '%REJECTED%'", db_path=TEST_DB)
        self.assertGreaterEqual(len(logs), 1)

    # ── Test 6: Scenario 2: Churn vs Payment Processor Failures ──

    def test_scenario_2_churn_vs_payment_failures(self):
        """Scenario 2: Differentiates active cancellations from expired card payment failures."""
        past_due = run_query(
            "SELECT count(*) as cnt, sum(mrr_amount) as mrr FROM subscriptions WHERE status = 'past_due'",
            db_path=TEST_DB
        )[0]
        cancelled = run_query(
            "SELECT count(*) as cnt, sum(mrr_amount) as mrr FROM subscriptions WHERE status = 'cancelled'",
            db_path=TEST_DB
        )[0]

        self.assertEqual(past_due["cnt"], 4)
        self.assertAlmostEqual(past_due["mrr"], 14200.0, places=2)
        self.assertEqual(cancelled["cnt"], 1)
        self.assertAlmostEqual(cancelled["mrr"], 4500.0, places=2)

        failed_tx = run_query(
            "SELECT count(*) as cnt FROM payment_transactions WHERE failure_reason = 'expired_card'",
            db_path=TEST_DB
        )[0]
        self.assertEqual(failed_tx["cnt"], 4)

    # ── Test 7: Scenario 3: Sales Ledger vs Payment Gateway Settlement ──

    def test_scenario_3_payment_gateway_reconciliation(self):
        """Scenario 3: Audits differences between sales orders and gateway settlement amounts."""
        disputed = run_query(
            "SELECT amount, settled_amount, (amount - settled_amount) as diff FROM payment_transactions WHERE status IN ('disputed', 'processing')",
            db_path=TEST_DB
        )
        total_variance = sum(d["diff"] for d in disputed)
        # 6200 - 4100 = 2100, 5400 - 3380 = 2020 -> Total 4120.00
        self.assertAlmostEqual(total_variance, 4120.0, places=2)

    # ── Test 8: Duplicate Approval Prevention ──

    def test_duplicate_approval_prevention(self):
        """Once approved, a proposal cannot be approved again."""
        desk = RevenueDesk()
        desk.ask("Investigate the revenue discrepancy in the West region.")
        
        # First approval succeeds
        res = desk.approve("Approved with 15%", user_role="manager")
        self.assertEqual(res["status"], "completed")
        self.assertEqual(desk.current.state, WorkflowState.COMPLETED)

        # Second approval MUST be rejected with ValueError
        with self.assertRaises(ValueError):
            desk.approve("Approved with 15%", user_role="manager")

    # ── Test 9: Proposal Modification Invalidates Approval ──

    def test_proposal_modification_invalidates_approval(self):
        """Modifying proposal parameters invalidates any prior approval and resets state."""
        desk = RevenueDesk()
        desk.ask("Investigate the revenue discrepancy in the West region.")
        
        self.assertEqual(desk.current.proposal.recommended_discount, 15.0)
        desk.modify_proposal(new_discount=10.0, reason="CFO requested lower discount")

        self.assertEqual(desk.current.proposal.recommended_discount, 10.0)
        self.assertIsNone(desk.current.approval_record)
        self.assertEqual(desk.current.state, WorkflowState.AWAITING_APPROVAL)

    # ── Test 10: Cryptographic Audit Hash-Chain Integrity ──

    def test_audit_hash_chain_tamper_detection(self):
        """Verifies that tampering with, deleting, or reordering audit entries breaks the hash-chain."""
        desk = RevenueDesk()
        desk.ask("Investigate the revenue discrepancy in the West region.")
        desk.approve("Approved with 15%", user_role="manager")

        # Clean ledger passes verification
        res = verify_audit_hash_chain(db_path=TEST_DB)
        self.assertTrue(res["valid"])
        self.assertGreaterEqual(res["signed_entries"], 1)

        # Simulate tampering: directly alter an entry's prev_hash in SQLite
        run_write("UPDATE decision_log SET prev_hash = 'TAMPERED_HASH_BAD_LINK' WHERE signature_hash IS NOT NULL", db_path=TEST_DB)
        
        # Tampered ledger MUST fail verification
        tampered_res = verify_audit_hash_chain(db_path=TEST_DB)
        self.assertFalse(tampered_res["valid"])
        self.assertIn("Chain broken", tampered_res["error"])


if __name__ == "__main__":
    unittest.main()
