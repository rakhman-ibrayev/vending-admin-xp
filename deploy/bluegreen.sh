#!/usr/bin/env bash
set -euo pipefail

APP="${1:-}"
if [[ ! "$APP" =~ ^(prod|dev)$ ]]; then
  echo "Usage: $0 <prod|dev>"
  exit 1
fi

DEPLOY_ROOT="/srv/expresspharm"
STATE_FILE="$DEPLOY_ROOT/.${APP}-active"
LOCK_FILE="$DEPLOY_ROOT/.${APP}-deploy.lock"

# Prevent concurrent deploys
exec 200>"$LOCK_FILE"
flock -n 200 || { echo "Deploy already in progress"; exit 1; }

# Determine current and next
if [ ! -f "$STATE_FILE" ]; then
  echo "a" > "$STATE_FILE"
fi
ACTIVE=$(cat "$STATE_FILE")

if [ "$ACTIVE" = "a" ]; then
  OLD="web-${APP}-a"
  NEW="web-${APP}-b"
  NEXT="b"
else
  OLD="web-${APP}-b"
  NEW="web-${APP}-a"
  NEXT="a"
fi

echo "🔄 Deploying $APP: $OLD → $NEW"

# Pull and start new container
docker compose pull "$NEW"
docker compose up -d "$NEW"

# Wait for container to be ready
echo "⏳ Waiting for $NEW to be ready..."
sleep 15

# Get actual container name from docker-compose
CONTAINER_NAME=$(docker compose ps -q "$NEW" | xargs docker inspect --format '{{.Name}}' | sed 's/\///')

# Simple HTTP health check
NEW_PORT=$(docker port "$CONTAINER_NAME" 3000 | cut -d: -f2)
for i in {1..10}; do
  if curl -sf "http://localhost:$NEW_PORT" > /dev/null 2>&1; then
    echo "✅ $NEW is responding"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ $NEW failed to respond, rolling back"
    docker compose logs --tail=50 "$NEW"
    docker compose rm -sf "$NEW"
    exit 1
  fi
  sleep 3
done

# Caddy automatically detects the running container via health checks
echo "⏳ Waiting for Caddy to detect new upstream..."
sleep 5

# Verify switch worked
if [ "$APP" = "prod" ]; then
  DOMAIN="admin.expresspharm.kz"
else
  DOMAIN="admin-dev.expresspharm.kz"
fi

if curl -sf "https://$DOMAIN" > /dev/null; then
  echo "✅ New version responding correctly"
else
  echo "⚠️  Warning: health check failed"
fi

# Remove old container
echo "🗑️  Removing old container $OLD"
docker compose rm -sf "$OLD"

# Update state
echo "$NEXT" > "$STATE_FILE"
echo "✅ Successfully deployed $NEW"

# Cleanup
docker image prune -f
