#!/usr/bin/env bash

# UTILS

check_port() {
  local PORT=$1
  if command -v lsof &> /dev/null; then
    if lsof -iTCP:"$PORT" -sTCP:LISTEN -t > /dev/null; then
      echo "⚠️ Port $PORT is already in use."
    fi
  elif command -v nc &> /dev/null; then
    if nc -z localhost "$PORT" 2>/dev/null; then
      echo "⚠️ Port $PORT is already in use."
    fi
  fi
}

wait_for_service_healthy() {
  local SERVICE_NAME=$1
  local TIMEOUT=${2:-60}
  echo "⏳ Waiting for service '$SERVICE_NAME' to be healthy..."

  SECONDS=0
  while [ $SECONDS -lt "$TIMEOUT" ]; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$SERVICE_NAME" 2>/dev/null || echo "not-found")
    if [ "$STATUS" == "healthy" ]; then
      echo "✅ Service '$SERVICE_NAME' is healthy!"
      return 0
    elif [ "$STATUS" == "unhealthy" ]; then
      echo "❌ Service '$SERVICE_NAME' is unhealthy."
      return 1
    elif [ "$STATUS" == "not-found" ]; then
      echo "❌ Service '$SERVICE_NAME' not found."
      return 1
    fi
    sleep 1
  done

  echo "❌ Timeout waiting for service '$SERVICE_NAME' to become healthy."
  return 1
}

# SCRIPT

echo "🚀 Starting development environment..."

# Check for Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker and try again."
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check common ports used in your compose file
echo "🔍 Checking for port conflicts..."
for port in 3000 5432 9005 9006; do
  check_port "$port"
done

echo "📦 Bringing up docker services..."
docker compose up -d --build --remove-orphans


echo "✅ All services started successfully."
echo "Run 'pnpm db:generate' to update the database schema!"
echo "Run 'pnpm dev' to start the app!"