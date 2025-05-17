#!/usr/bin/env bash

echo "🧹 Cleaning up Docker containers and volumes..."

# Stop and remove all services
docker compose down --volumes --remove-orphans

# Optionally prune dangling volumes (not strictly needed for named ones)
# docker volume prune -f

echo "✅ Cleanup complete. You can now run './start-dev.sh' to bring up a fresh environment."
