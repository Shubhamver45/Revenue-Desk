"""Revenue Desk — Interactive CLI demo.

Run this to test the full workflow locally without Switch.
Perfect for development and demo recording.
"""

from __future__ import annotations

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database import init_database
from src.workflow import RevenueDesk, WorkflowState


# ── Pretty printing ────────────────────────────────────────────────────

COLORS = {
    "Manager": "\033[96m",    # Cyan
    "Analyst": "\033[93m",    # Yellow
    "Reviewer": "\033[92m",   # Green
    "System": "\033[90m",     # Gray
    "reset": "\033[0m",
}


def colorize(sender: str, message: str) -> str:
    color = COLORS.get(sender, COLORS["reset"])
    reset = COLORS["reset"]
    return f"{color}[{sender}]{reset} {message}"


def on_message(sender: str, message: str) -> None:
    """Callback that prints messages to the terminal."""
    print()
    print(colorize(sender, message))
    print()


# ── Main ───────────────────────────────────────────────────────────────

def main() -> None:
    print("""
╔══════════════════════════════════════════════════════════════╗
║                   💰 REVENUE DESK                           ║
║          AI Analyst + Reviewer + Human Approval             ║
║                                                             ║
║  Two AI agents collaborate with you to analyze data,        ║
║  verify findings, and take action — with your approval.     ║
╚══════════════════════════════════════════════════════════════╝
    """)

    # Initialize database
    init_database()

    # Create workflow
    desk = RevenueDesk(on_message=on_message)

    print("Type a business question to get started.")
    print("Example: \"Why did repeat purchases drop in the West region last month?\"")
    print("Type 'quit' to exit, 'history' to see past workflows.\n")

    while True:
        try:
            # Check if we're awaiting approval
            if desk.current and desk.current.state == WorkflowState.AWAITING_APPROVAL:
                user_input = input("\n🔒 [Manager — enter approval] > ").strip()
                if not user_input:
                    continue
                if user_input.lower() == "quit":
                    break
                desk.approve(user_input)

            else:
                user_input = input("\n💬 [Manager] > ").strip()
                if not user_input:
                    continue
                if user_input.lower() == "quit":
                    print("\nGoodbye! 👋")
                    break
                if user_input.lower() == "history":
                    print(desk.get_history_summary())
                    continue
                if user_input.lower() == "status":
                    print(desk.get_status())
                    continue

                # Start workflow
                print("\n" + "─" * 60)
                desk.ask(user_input)

        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    main()

