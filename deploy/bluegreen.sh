#!/usr/bin/env bash
set -euo pipefail

# Usage: ./bluegreen.sh <prod|dev> [--skip-confirmation]

APP="${1:-}"
SKIP_CONFIRMATION="${2:-}"

if [[ ! "$APP" =~ ^(prod|dev)$ ]]; then
  echo "Usage: $0 <prod|dev> [--skip-confirmation]"
  exit 1
fi

DEPLOY_ROOT="/srv/expresspharm"
STATE_FILE="$DEPLOY_ROOT/.${APP}-active"
LOCK_FILE="$DEPLOY_ROOT/.${APP}-deploy.lock"
CADDY_CONTAINER="${CADDY_CONTAINER:-caddy}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

die() {
  log "ERROR: $1"
  if [ -n "${NEW:-}" ]; then
    docker compose logs --tail=50 "$NEW"
    docker compose rm -sf "$NEW" 2>/dev/null || true
  fi
  exit 1
}

rollback() {
  log "Rolling back..."
  # Reconnect old container alias if needed
  if [ -n "${OLD_CONTAINER_NAME:-}" ] && [ -n "${ALIAS_NAME:-}" ] && [ -n "${CADDY_NET:-}" ]; then
    docker network connect --alias "$ALIAS_NAME" "$CADDY_NET" "$OLD_CONTAINER_NAME" 2>/dev/null || true
  fi
  die "$1"
}

# Prevent concurrent deploys
exec 200>"$LOCK_FILE"
flock -n 200 || die "Deploy already in progress"
trap 'flock -u 200' EXIT

# Determine which container to deploy
[ ! -f "$STATE_FILE" ] && echo "a" > "$STATE_FILE"
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

# Production confirmation
if [ "$APP" = "prod" ] && [ "$SKIP_CONFIRMATION" != "--skip-confirmation" ]; then
  read -p "⚠️  Deploy to PRODUCTION ($OLD → $NEW)? (yes/no): " -r
  [[ ! $REPLY =~ ^[Yy]es$ ]] && exit 0
fi

log "🔄 Deploying $APP: $OLD → $NEW"

# Set domain and alias
if [ "$APP" = "prod" ]; then
  ALIAS_NAME="web-prod"
  DOMAIN="https://admin.expresspharm.kz"
else
  ALIAS_NAME="web-dev"
  DOMAIN="https://admin-dev.expresspharm.kz"
fi

# Pull and start new container
log "Pulling $NEW..."
docker compose pull --quiet "$NEW" || die "Failed to pull image"

log "Starting $NEW..."
docker compose up -d "$NEW" || die "Failed to start container"

NEW_ID=$(docker compose ps -q "$NEW" || true)
[ -z "$NEW_ID" ] && die "Failed to get container ID for $NEW"
CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$NEW_ID" | sed 's#^/##')
[ -z "$CONTAINER_NAME" ] && die "Failed to get container name"

log "Container started: $CONTAINER_NAME"
log "Waiting 5s for Next.js to start..."
sleep 5

# Attach network alias (both old and new will have it temporarily for zero-downtime)
CADDY_NET=$(docker inspect --format '{{range $k,$v:=.NetworkSettings.Networks}}{{$k}}{{end}}' "$CADDY_CONTAINER" 2>/dev/null || true)
[ -z "$CADDY_NET" ] && die "Cannot find Caddy network"

OLD_CONTAINER_ID=$(docker compose ps -q "$OLD" 2>/dev/null || true)
if [ -n "$OLD_CONTAINER_ID" ]; then
  OLD_CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$OLD_CONTAINER_ID" | sed 's#^/##')
fi

log "Attaching alias $ALIAS_NAME to $CONTAINER_NAME on $CADDY_NET"
for i in {1..3}; do
  if docker network connect --alias "$ALIAS_NAME" "$CADDY_NET" "$CONTAINER_NAME" 2>/dev/null; then
    break
  fi
  docker network disconnect "$CADDY_NET" "$CONTAINER_NAME" 2>/dev/null || true
  sleep 2
  [ $i -eq 3 ] && rollback "Failed to attach alias $ALIAS_NAME after retries"
done

log "Waiting 5s for Caddy to detect new container..."
sleep 5

# Health check new container
NEW_PORT=$(docker port "$CONTAINER_NAME" 3000 | cut -d: -f2)
log "Health checking on port $NEW_PORT..."

for i in {1..10}; do
  STATUS=$(docker inspect "$CONTAINER_NAME" --format='{{.State.Status}}')
  
  # Allow grace period for startup
  if [ "$STATUS" != "running" ] && [ $i -gt 3 ]; then
    die "Container crashed (status: $STATUS)"
  fi
  
  # Check if responding
  if curl -sf --max-time 5 "http://localhost:$NEW_PORT/api/health" > /dev/null 2>&1; then
    log "✓ Health check passed"
    break
  fi
  
  [ $i -eq 10 ] && die "Health check failed after 10 attempts"
  sleep 3
done

# Verify public access through Caddy
log "Checking public domain: $DOMAIN"
for i in {1..5}; do
  if curl -sf --max-time 10 "$DOMAIN" > /dev/null 2>&1; then
    log "✓ Public domain OK"
    break
  fi
  [ $i -eq 5 ] && rollback "Public domain unreachable"
  sleep 2
done

# Remove old container (after new one is validated)
if [ -n "${OLD_CONTAINER_NAME:-}" ]; then
  log "Disconnecting old container alias: $OLD_CONTAINER_NAME"
  docker network disconnect "$CADDY_NET" "$OLD_CONTAINER_NAME" 2>/dev/null || true
  sleep 3

  log "Removing old container: $OLD"
  docker compose rm -sf "$OLD" 2>/dev/null || log "Warning: could not remove $OLD"
fi

# Update state and cleanup
printf '%s\n' "$NEXT" > "$STATE_FILE"
docker image prune -f > /dev/null 2>&1 || true

log "✅ Deployment complete: $NEW is now active"
docker compose ps "$NEW"
