"""Tests for Revenue Desk seed data (Standard library unittest)."""

import os
import sys
import unittest
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.database import init_database, run_query

TEST_DB = "/tmp/revenue_desk_test_seed.db"


class TestSeedData(unittest.TestCase):
    """Verify the seed data tells the right story."""

    def setUp(self):
        os.environ["DB_PATH"] = TEST_DB
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)
        init_database(TEST_DB)

    def tearDown(self):
        if os.path.exists(TEST_DB):
            os.remove(TEST_DB)

    def test_customer_count(self):
        result = run_query("SELECT COUNT(*) as cnt FROM customers", db_path=TEST_DB)
        self.assertEqual(result[0]["cnt"], 80)

    def test_regions_balanced(self):
        result = run_query(
            "SELECT region, COUNT(*) as cnt FROM customers GROUP BY region ORDER BY region",
            db_path=TEST_DB,
        )
        regions = {r["region"]: r["cnt"] for r in result}
        self.assertEqual(regions, {"central": 20, "east": 20, "south": 20, "west": 20})

    def test_west_enterprise_customers(self):
        result = run_query(
            "SELECT COUNT(*) as cnt FROM customers WHERE region='west' AND segment='enterprise'",
            db_path=TEST_DB,
        )
        self.assertEqual(result[0]["cnt"], 5)

    def test_west_enterprise_sept_orders_exist(self):
        """West enterprise customers should have September orders."""
        result = run_query(
            """
            SELECT COUNT(*) as cnt FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west' AND c.segment = 'enterprise'
            AND o.order_date BETWEEN '2026-09-01' AND '2026-09-30'
            AND o.is_repeat = 1
            """,
            db_path=TEST_DB,
        )
        self.assertEqual(result[0]["cnt"], 5)

    def test_west_enterprise_oct_orders_zero(self):
        """West enterprise customers should have NO October orders — this is the drop."""
        result = run_query(
            """
            SELECT COUNT(*) as cnt FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west' AND c.segment = 'enterprise'
            AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31'
            """,
            db_path=TEST_DB,
        )
        self.assertEqual(result[0]["cnt"], 0)

    def test_refunds_exist_for_october_west(self):
        """There should be refunds for October West orders (the trap)."""
        result = run_query(
            """
            SELECT COUNT(*) as cnt, SUM(r.amount) as total
            FROM refunds r
            JOIN orders o ON r.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
            AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31'
            """,
            db_path=TEST_DB,
        )
        self.assertEqual(result[0]["cnt"], 8)
        self.assertEqual(result[0]["total"], 20430.00)

    def test_naive_vs_correct_west_oct_revenue(self):
        """
        The naive query (no refund check) should show higher revenue
        than the correct query (with refunds subtracted).
        This is the discrepancy the Reviewer should catch.
        """
        naive = run_query(
            """
            SELECT SUM(o.amount) as revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.region = 'west'
            AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31'
            """,
            db_path=TEST_DB,
        )

        correct = run_query(
            """
            SELECT SUM(o.amount) - COALESCE(SUM(r.amount), 0) as net_revenue
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN refunds r ON o.id = r.order_id
            WHERE c.region = 'west'
            AND o.order_date BETWEEN '2026-10-01' AND '2026-10-31'
            """,
            db_path=TEST_DB,
        )

        naive_revenue = naive[0]["revenue"]
        net_revenue = correct[0]["net_revenue"]

        self.assertGreater(naive_revenue, net_revenue)
        self.assertAlmostEqual(naive_revenue - net_revenue, 20430.00, delta=1.0)


if __name__ == "__main__":
    unittest.main()
