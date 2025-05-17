#!/usr/bin/env bash

echo "🛑 Stopping Docker..."

# Stop Docker services
docker compose down --remove-orphans

echo "✅ Dev environment stopped. You can now run './clean-dev.sh' if you want to clear your data."
