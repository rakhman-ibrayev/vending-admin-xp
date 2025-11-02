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

# Simple HTTP health check
NEW_PORT=$(docker port "$NEW" 3000 | cut -d: -f2)
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

# Generate new Caddyfile with updated upstream
CADDYFILE="$DEPLOY_ROOT/deploy/caddy/Caddyfile"
if [ "$APP" = "prod" ]; then
  DOMAIN="admin.expresspharm.kz"
  PROD_UPSTREAM="$NEW"
  DEV_UPSTREAM="web-dev-$ACTIVE"
else
  DOMAIN="admin-dev.expresspharm.kz"
  PROD_UPSTREAM="web-prod-$ACTIVE"
  DEV_UPSTREAM="$NEW"
fi

cat > "$CADDYFILE" <<EOF
admin.expresspharm.kz {
    reverse_proxy ${PROD_UPSTREAM}:3000
}

admin-dev.expresspharm.kz {
    reverse_proxy ${DEV_UPSTREAM}:3000
}
EOF

# Reload Caddy
echo "🔄 Reloading Caddy configuration..."
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

# Verify switch worked
sleep 3
if curl -sf "https://$DOMAIN" > /dev/null; then
  echo "✅ New version responding correctly"
else
  echo "⚠️  Warning: health check failed after switch"
fi

# Remove old container
echo "🗑️  Removing old container $OLD"
docker compose rm -sf "$OLD"

# Update state
echo "$NEXT" > "$STATE_FILE"
echo "✅ Successfully deployed $NEW"

# Cleanup
docker image prune -f
