FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir anthropic matrix-nio python-dotenv

# Copy source
COPY . .

# Create data directory
RUN mkdir -p data

# Default to CLI mode
ENV MODE=cli

CMD ["python", "main.py"]

