"""Revenue Desk — Configuration."""

import os
from dataclasses import dataclass, field
from pathlib import Path


def load_env_file():
    """Lightweight zero-dependency .env loader."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k not in os.environ:
                    os.environ[k] = v


load_env_file()


@dataclass
class Config:
    """Application configuration loaded from environment variables."""

    # Database
    db_path: str = field(default_factory=lambda: os.getenv("DB_PATH", "data/revenue_desk.db"))

    # LLM Provider: 'gemini', 'anthropic', 'groq', or 'mock'
    llm_provider: str = field(default_factory=lambda: os.getenv("LLM_PROVIDER", "").lower())
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    anthropic_api_key: str = field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", ""))
    groq_api_key: str = field(default_factory=lambda: os.getenv("GROQ_API_KEY", ""))
    model: str = field(default_factory=lambda: os.getenv("LLM_MODEL", ""))
    max_tokens: int = field(default_factory=lambda: int(os.getenv("LLM_MAX_TOKENS", "4096")))

    # Switch bridge
    switch_homeserver: str = field(default_factory=lambda: os.getenv("SWITCH_HOMESERVER", ""))
    switch_room_id: str = field(default_factory=lambda: os.getenv("SWITCH_ROOM_ID", ""))
    analyst_user_id: str = field(default_factory=lambda: os.getenv("ANALYST_USER_ID", ""))
    analyst_password: str = field(default_factory=lambda: os.getenv("ANALYST_PASSWORD", ""))
    reviewer_user_id: str = field(default_factory=lambda: os.getenv("REVIEWER_USER_ID", ""))
    reviewer_password: str = field(default_factory=lambda: os.getenv("REVIEWER_PASSWORD", ""))

    # Behaviour
    auto_approve: bool = field(default_factory=lambda: os.getenv("AUTO_APPROVE", "false").lower() == "true")

    def validate(self) -> list[str]:
        """Return a list of missing-but-required config keys."""
        issues: list[str] = []
        if not self.anthropic_api_key:
            issues.append("ANTHROPIC_API_KEY is not set")
        if not self.switch_homeserver:
            issues.append("SWITCH_HOMESERVER is not set")
        return issues


config = Config()

