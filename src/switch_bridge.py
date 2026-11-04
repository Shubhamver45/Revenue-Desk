"""Revenue Desk — Switch Room Bridge.

Connects the Revenue Desk workflow to a Switch room via the Matrix protocol.
Agents appear as distinct users in the room.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

try:
    from nio import AsyncClient, MatrixRoom, RoomMessageText, LoginResponse
    HAS_NIO = True
except ImportError:
    HAS_NIO = False

from src.config import config
from src.workflow import RevenueDesk

logger = logging.getLogger("revenue_desk.bridge")


class SwitchBridge:
    """
    Bridges the Revenue Desk into a Switch room.

    Architecture:
    - Two Matrix bot accounts (Analyst, Reviewer) join the room.
    - The bridge listens for messages from humans.
    - When a human asks a question, it triggers the workflow.
    - Agent responses are posted as the respective bot accounts.
    """

    def __init__(self) -> None:
        if not HAS_NIO:
            raise ImportError(
                "matrix-nio is required for Switch integration. "
                "Install with: pip install matrix-nio"
            )

        self.analyst_client: AsyncClient | None = None
        self.reviewer_client: AsyncClient | None = None
        self.listener_client: AsyncClient | None = None
        self.desk: RevenueDesk | None = None
        self.room_id = config.switch_room_id

    async def setup(self) -> None:
        """Initialize Matrix clients and log in."""
        logger.info("Setting up Switch bridge...")

        # Create clients
        self.analyst_client = AsyncClient(
            config.switch_homeserver,
            config.analyst_user_id,
        )
        self.reviewer_client = AsyncClient(
            config.switch_homeserver,
            config.reviewer_user_id,
        )

        # Log in
        analyst_login = await self.analyst_client.login(config.analyst_password)
        if not isinstance(analyst_login, LoginResponse):
            raise RuntimeError(f"Analyst login failed: {analyst_login}")
        logger.info(f"Analyst logged in as {config.analyst_user_id}")

        reviewer_login = await self.reviewer_client.login(config.reviewer_password)
        if not isinstance(reviewer_login, LoginResponse):
            raise RuntimeError(f"Reviewer login failed: {reviewer_login}")
        logger.info(f"Reviewer logged in as {config.reviewer_user_id}")

        # Use analyst client as the listener
        self.listener_client = self.analyst_client

        # Set up the workflow with message posting callback
        self.desk = RevenueDesk(on_message=self._post_message_sync)

        # Join the room
        await self.analyst_client.join(self.room_id)
        await self.reviewer_client.join(self.room_id)
        logger.info(f"Both agents joined room {self.room_id}")

    def _post_message_sync(self, sender: str, message: str) -> None:
        """Synchronous wrapper for posting messages (used by workflow callback)."""
        asyncio.create_task(self._post_message(sender, message))

    async def _post_message(self, sender: str, message: str) -> None:
        """Post a message to the room as the appropriate agent."""
        client = None
        if sender == "Analyst":
            client = self.analyst_client
        elif sender == "Reviewer":
            client = self.reviewer_client
        elif sender == "System":
            client = self.analyst_client  # System messages via Analyst account
        else:
            return  # Manager messages come from the human, not us

        if client:
            await client.room_send(
                self.room_id,
                message_type="m.room.message",
                content={
                    "msgtype": "m.text",
                    "body": message,
                    "format": "org.matrix.custom.html",
                    "formatted_body": self._markdown_to_html(message),
                },
            )

    async def listen(self) -> None:
        """Start listening for messages in the room."""
        if not self.listener_client or not self.desk:
            raise RuntimeError("Call setup() first")

        logger.info("Listening for messages...")

        def message_callback(room: MatrixRoom, event: RoomMessageText) -> None:
            # Ignore our own messages
            if event.sender in (config.analyst_user_id, config.reviewer_user_id):
                return

            # Only process messages in our room
            if room.room_id != self.room_id:
                return

            body = event.body.strip()
            logger.info(f"Received from {event.sender}: {body}")

            # Check if this is an approval response
            if self.desk and self.desk.current and \
               self.desk.current.state.name == "AWAITING_APPROVAL":
                asyncio.create_task(self._handle_approval(body))
            else:
                asyncio.create_task(self._handle_question(body))

        self.listener_client.add_event_callback(message_callback, RoomMessageText)
        await self.listener_client.sync_forever(timeout=30000)

    async def _handle_question(self, question: str) -> None:
        """Handle a new question from the manager."""
        if self.desk:
            # Run in executor to not block the event loop
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.desk.ask, question)

    async def _handle_approval(self, response: str) -> None:
        """Handle an approval response from the manager."""
        if self.desk:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self.desk.approve, response)

    @staticmethod
    def _markdown_to_html(text: str) -> str:
        """Basic markdown-to-HTML conversion for Matrix."""
        # Bold
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        # Code blocks
        text = re.sub(r'```(\w*)\n(.*?)```', r'<pre><code>\2</code></pre>', text, flags=re.DOTALL)
        # Inline code
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        # Line breaks
        text = text.replace('\n', '<br>')
        return text

    async def shutdown(self) -> None:
        """Clean shutdown."""
        if self.analyst_client:
            await self.analyst_client.close()
        if self.reviewer_client:
            await self.reviewer_client.close()
        logger.info("Switch bridge shut down.")


async def run_bridge() -> None:
    """Main entry point for the Switch bridge."""
    bridge = SwitchBridge()
    try:
        await bridge.setup()
        await bridge.listen()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        await bridge.shutdown()

