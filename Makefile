.PHONY: setup run demo bridge test clean

# ── Quick Start ──────────────────────────────────────────────────

setup:  ## Initialize database with seed data
	@mkdir -p data
	@python -c "from src.database import init_database; init_database()"
	@echo "✅ Database ready at data/revenue_desk.db"

ui: setup  ## Run the modern Light-Theme Web UI
	@python3 app.py

run: setup  ## Run the interactive CLI demo
	@MODE=cli python main.py

report:  ## Generate executive HTML report
	@python3 scripts/export_report.py

demo: run  ## Alias for 'run'

bridge: setup  ## Run with Switch bridge integration
	@MODE=bridge python main.py

# ── Docker ───────────────────────────────────────────────────────

docker-build:  ## Build Docker image
	docker-compose build

docker-run:  ## Run in Docker (interactive CLI)
	docker-compose run --rm revenue-desk

docker-bridge:  ## Run Switch bridge in Docker
	MODE=bridge docker-compose up revenue-desk-bridge

# ── Development ──────────────────────────────────────────────────

test:  ## Run tests
	pytest tests/ -v

clean:  ## Remove database and generated files
	rm -rf data/
	@echo "🧹 Cleaned."

# ── Help ─────────────────────────────────────────────────────────

help:  ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

