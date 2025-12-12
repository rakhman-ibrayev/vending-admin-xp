#!/usr/bin/env bash
set -euo pipefail

# --- Configuration & Setup ---
APP="${1:-}"
SKIP_CONFIRMATION="${2:-}"
DEPLOY_ROOT="/srv/expresspharm"
STATE_FILE="$DEPLOY_ROOT/.${APP}-active"
LOCK_FILE="$DEPLOY_ROOT/.${APP}-deploy.lock"
CADDY_CONTAINER="${CADDY_CONTAINER:-caddy}"
HEALTH_ENDPOINT="/api/health"

# --- Functions ---
log() { echo "[$(date '+%H:%M:%S')] $*"; }

die() {
  log "❌ ERROR: $1"
  if [ -n "${NEW:-}" ]; then
    docker compose logs --tail=10 "$NEW" 2>/dev/null || true
    docker compose rm -sf "$NEW" 2>/dev/null || true
  fi
  flock -u 200; exit 1
}

get_cname() { docker inspect --format '{{.Name}}' "$1" | sed 's#^/##'; }

# --- Pre-Checks ---
if [[ ! "$APP" =~ ^(prod|dev)$ ]]; then
  echo "Usage: $0 <prod|dev> [--skip-confirmation]"; exit 1
fi

exec 200>"$LOCK_FILE"; flock -n 200 || die "Deploy already in progress"
trap 'flock -u 200' EXIT

CADDY_NET=$(docker inspect --format '{{range $k,$v:=.NetworkSettings.Networks}}{{$k}}{{end}}' "$CADDY_CONTAINER" 2>/dev/null || true)
[ -z "$CADDY_NET" ] && die "Cannot find Caddy network"

# Determine A/B containers
ACTIVE=$(cat "$STATE_FILE" 2>/dev/null || echo "a")
if [ "$ACTIVE" = "a" ]; then
  OLD="web-${APP}-a"; NEW="web-${APP}-b"; NEXT="b"
else
  OLD="web-${APP}-b"; NEW="web-${APP}-a"; NEXT="a"
fi
ALIAS_NAME="web-$APP"

# Production confirmation (if required)
if [ "$APP" = "prod" ] && [ "$SKIP_CONFIRMATION" != "--skip-confirmation" ]; then
  read -p "⚠️ Deploy to PRODUCTION ($OLD → $NEW)? (yes/no): " -r
  [[ ! $REPLY =~ ^[Yy]es$ ]] && exit 0
fi

log "🔄 Deploying $APP: $OLD → $NEW"

# --- Deployment Steps ---
# 1. Pull, Start, and Attach New Container
log "Pulling and starting $NEW..."
docker compose pull --quiet "$NEW" || die "Failed to pull image"
docker compose up -d "$NEW" || die "Failed to start $NEW"

NEW_ID=$(docker compose ps -q "$NEW" || die "Failed to get ID for $NEW")
NEW_CONTAINER_NAME=$(get_cname "$NEW_ID")

log "Attaching alias '$ALIAS_NAME' to $NEW_CONTAINER_NAME (Dual-Homing)."
docker network connect --alias "$ALIAS_NAME" "$CADDY_NET" "$NEW_CONTAINER_NAME" || die "Failed to connect network alias"

# 2. Health Check
NEW_PORT=$(docker port "$NEW_CONTAINER_NAME" 3000 | cut -d: -f2)
log "Awaiting internal health check on port $NEW_PORT..."

for i in {1..20}; do
  STATUS=$(docker inspect "$NEW_CONTAINER_NAME" --format='{{.State.Status}}')
  [ "$STATUS" != "running" ] && die "Container crashed ($STATUS)"
  
  curl -sf --max-time 3 "http://localhost:$NEW_PORT$HEALTH_ENDPOINT" > /dev/null 2>&1 && { log "✅ Health check passed"; break; }
  
  [ "$i" -eq 20 ] && die "Health check failed after 20 attempts"
  sleep 2
done

# 3. The Switch (Graceful Shutdown & Disconnect)
log "Waiting for Caddy to mark $NEW healthy (15s)..."; sleep 15

if OLD_ID=$(docker compose ps -q "$OLD" 2>/dev/null); then
  OLD_CONTAINER_NAME=$(get_cname "$OLD_ID")

  log "Stopping $OLD (SIGTERM) for graceful FIN..."
  docker compose stop -t 10 "$OLD" 2>/dev/null || log "Warning: Stop failed for $OLD"
  
  log "Disconnecting alias '$ALIAS_NAME' from $OLD_CONTAINER_NAME."
  docker network disconnect "$CADDY_NET" "$OLD_CONTAINER_NAME" 2>/dev/null || true
  
  log "Waiting 8s for SSE reconnect..."; sleep 8
  
  log "Removing $OLD."
  docker compose rm -f "$OLD" 2>/dev/null || log "Warning: Removal failed for $OLD"
fi

# 4. Finalize
printf '%s\n' "$NEXT" > "$STATE_FILE"
docker image prune -f > /dev/null 2>&1 || true

log "✅ Deployment complete: $NEW is now active."
docker compose ps "$NEW"
