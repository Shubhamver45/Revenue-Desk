"""Entry point for running the Switch bridge."""

import asyncio
import logging
import os
import sys

# Optional dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

from src.database import init_database


def main():
    """Start the Revenue Desk."""
    # Initialize database first
    init_database()

    mode = os.getenv("MODE", "cli").lower()

    if mode == "bridge":
        # Run with Switch integration
        from src.switch_bridge import run_bridge
        print("Starting Revenue Desk in Switch bridge mode...")
        asyncio.run(run_bridge())

    elif mode == "cli":
        # Run interactive CLI demo
        from src.cli_demo import main as cli_main
        cli_main()

    else:
        print(f"Unknown mode: {mode}. Use MODE=cli or MODE=bridge")
        sys.exit(1)


if __name__ == "__main__":
    main()

