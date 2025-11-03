#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Blue-Green Deployment Script
# ============================================================================
# Usage: ./bluegreen.sh <prod|dev> [--skip-confirmation]
# 
# This script performs a zero-downtime blue-green deployment by:
# 1. Starting a new container instance
# 2. Validating it's healthy
# 3. Switching traffic via network alias
# 4. Removing the old container
# ============================================================================

# Configuration
readonly DEPLOY_ROOT="/srv/expresspharm"
readonly HEALTH_CHECK_TIMEOUT=30
readonly HEALTH_CHECK_RETRIES=10
readonly HEALTH_CHECK_INTERVAL=3
readonly CADDY_PROPAGATION_WAIT=15
readonly CADDY_SWITCH_WAIT=10
readonly DOMAINS_PROD="admin.expresspharm.kz"
readonly DOMAINS_DEV="admin-dev.expresspharm.kz"

# Parse arguments
APP="${1:-}"
SKIP_CONFIRMATION="${2:-}"

# Validate environment
if [[ ! "$APP" =~ ^(prod|dev)$ ]]; then
  echo "Usage: $0 <prod|dev> [--skip-confirmation]"
  exit 1
fi

readonly STATE_FILE="$DEPLOY_ROOT/.${APP}-active"
readonly LOCK_FILE="$DEPLOY_ROOT/.${APP}-deploy.lock"

# ============================================================================
# Utility Functions
# ============================================================================

log() {
  local level="$1"
  shift
  local msg="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [$level] $msg"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_success() { log "SUCCESS" "$@"; }

cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    log_error "Deployment failed with exit code $exit_code"
  fi
  # Release lock
  flock -u 200 2>/dev/null || true
}

trap cleanup EXIT

rollback() {
  local reason="$1"
  log_error "Rolling back: $reason"
  
  if [ -n "${NEW:-}" ]; then
    log_info "Stopping and removing new container: $NEW"
    docker compose logs --tail=100 "$NEW"
    docker compose rm -sf "$NEW" 2>/dev/null || true
  fi
  
  log_error "Rollback complete. Old container $OLD is still running."
  exit 1
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

# Prevent concurrent deploys
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  log_error "Deploy already in progress for $APP"
  exit 1
fi

log_info "Starting blue-green deployment for $APP environment"

# Verify Docker is available
if ! command -v docker &> /dev/null; then
  log_error "Docker is not installed or not in PATH"
  exit 1
fi

# Verify docker compose is available
if ! docker compose version &> /dev/null; then
  log_error "Docker Compose is not available"
  exit 1
fi

# Verify Caddy is running
if ! docker ps --filter "name=caddy" --filter "status=running" | grep -q caddy; then
  log_warn "Caddy container is not running - traffic routing may not work"
fi

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

# Production safety check
if [ "$APP" = "prod" ] && [ "$SKIP_CONFIRMATION" != "--skip-confirmation" ]; then
  log_warn "⚠️  Production deployment: $OLD → $NEW"
  read -p "Continue with production deployment? (yes/no): " -r
  if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    log_info "Deployment cancelled by user"
    exit 0
  fi
fi

log_info "🔄 Deploying $APP: $OLD → $NEW"

# ============================================================================
# Deploy New Container
# ============================================================================

log_info "Pulling latest image for $NEW"
if ! docker compose pull "$NEW"; then
  rollback "Failed to pull Docker image"
fi

log_info "Starting new container: $NEW"
if ! docker compose up -d "$NEW"; then
  rollback "Failed to start new container"
fi

# Get actual container name from docker-compose
CONTAINER_NAME=$(docker compose ps -q "$NEW" | xargs docker inspect --format '{{.Name}}' | sed 's/\///')

# Determine a stable alias name for Caddy and ensure the alias points to the newly started container
# This attaches a network alias (web-prod / web-dev) on the same network Caddy uses so Caddy DNS always
# resolves a single upstream name regardless of which blue/green instance is active.
if [ "$APP" = "prod" ]; then
  ALIAS_NAME="web-prod"
else
  ALIAS_NAME="web-dev"
fi

# Find the network name Caddy is attached to (use the first network found)
CADDY_NET=$(docker inspect --format '{{range $k,$v:=.NetworkSettings.Networks}}{{$k}}{{end}}' caddy 2>/dev/null || true)
if [ -n "$CADDY_NET" ]; then
  echo "Attaching alias $ALIAS_NAME on network $CADDY_NET to $CONTAINER_NAME"
  docker network connect --alias "$ALIAS_NAME" "$CADDY_NET" "$CONTAINER_NAME" || true

  # Wait for Docker DNS / Caddy to see the alias. We wait up to 15s.
  echo "Waiting for alias $ALIAS_NAME to propagate to network $CADDY_NET..."
  ALIAS_OK=0
  for i in $(seq 1 15); do
    # Check if the alias appears in the container's network settings
    if docker inspect "$CONTAINER_NAME" --format '{{json .NetworkSettings.Networks}}' 2>/dev/null | grep -q "\"$ALIAS_NAME\""; then
      echo "Alias $ALIAS_NAME present in container network (inspect)"
      ALIAS_OK=1
      break
    fi

    # Or check if Caddy can resolve the alias via getent hosts
    if docker exec caddy sh -c "getent hosts $ALIAS_NAME >/dev/null 2>&1"; then
      echo "Caddy resolves $ALIAS_NAME"
      ALIAS_OK=1
      break
    fi

    sleep 1
  done

  if [ "$ALIAS_OK" -ne 1 ]; then
    echo "Warning: alias $ALIAS_NAME not visible after wait; continuing but Caddy may not resolve it yet"
  fi

  # NOTE: do not remove the old container yet — wait until the new upstream is reachable by Caddy.
else
  echo "Warning: could not determine Caddy network; skipping alias attach/detach"
fi

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

log_info "New container started: $CONTAINER_NAME"

# Wait for container to be ready (Next.js needs time to start)
log_info "⏳ Waiting for $NEW to initialize..."
sleep 5

# Determine alias and domain
if [ "$APP" = "prod" ]; then
  ALIAS_NAME="web-prod"
  DOMAIN="$DOMAINS_PROD"
else
  ALIAS_NAME="web-dev"
  DOMAIN="$DOMAINS_DEV"
fi

# ============================================================================
# Network Configuration
# ============================================================================

# Find the network name Caddy is attached to
CADDY_NET=$(docker inspect --format '{{range $k,$v:=.NetworkSettings.Networks}}{{$k}}{{end}}' caddy 2>/dev/null || true)

if [ -z "$CADDY_NET" ]; then
  log_warn "Could not determine Caddy network; skipping alias management"
else
  log_info "Caddy is on network: $CADDY_NET"
  
  # Check if old container has the alias and remove it
  OLD_CONTAINER_ID=$(docker compose ps -q "$OLD" 2>/dev/null || true)
  if [ -n "$OLD_CONTAINER_ID" ]; then
    OLD_CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$OLD_CONTAINER_ID" 2>/dev/null | sed 's/\///' || true)
    if [ -n "$OLD_CONTAINER_NAME" ]; then
      # Check if old container has the alias
      if docker inspect "$OLD_CONTAINER_NAME" --format '{{json .NetworkSettings.Networks}}' 2>/dev/null | grep -q "\"$ALIAS_NAME\""; then
        log_info "Removing alias $ALIAS_NAME from old container: $OLD_CONTAINER_NAME"
        docker network disconnect "$CADDY_NET" "$OLD_CONTAINER_NAME" 2>/dev/null || true
        # Reconnect without alias
        docker network connect "$CADDY_NET" "$OLD_CONTAINER_NAME" 2>/dev/null || true
      fi
    fi
  fi
  
  log_info "Attaching alias $ALIAS_NAME on network $CADDY_NET to $CONTAINER_NAME"
  if ! docker network connect --alias "$ALIAS_NAME" "$CADDY_NET" "$CONTAINER_NAME" 2>/dev/null; then
    # Alias might already exist, try disconnecting and reconnecting
    docker network disconnect "$CADDY_NET" "$CONTAINER_NAME" 2>/dev/null || true
    if ! docker network connect --alias "$ALIAS_NAME" "$CADDY_NET" "$CONTAINER_NAME"; then
      rollback "Failed to attach network alias $ALIAS_NAME"
    fi
  fi

  # Wait for Docker DNS / Caddy to see the alias
  log_info "Waiting for alias $ALIAS_NAME to propagate..."
  ALIAS_OK=0
  for i in $(seq 1 $CADDY_PROPAGATION_WAIT); do
    # Check if the alias appears in the container's network settings
    if docker inspect "$CONTAINER_NAME" --format '{{json .NetworkSettings.Networks}}' 2>/dev/null | grep -q "\"$ALIAS_NAME\""; then
      log_info "✓ Alias $ALIAS_NAME confirmed in container network"
      ALIAS_OK=1
      break
    fi

    # Or check if Caddy can resolve the alias
    if docker exec caddy sh -c "getent hosts $ALIAS_NAME >/dev/null 2>&1" 2>/dev/null; then
      log_info "✓ Caddy successfully resolves $ALIAS_NAME"
      ALIAS_OK=1
      break
    fi

    sleep 1
  done

  if [ "$ALIAS_OK" -ne 1 ]; then
    log_warn "Alias $ALIAS_NAME not fully propagated; continuing with caution"
  fi
fi

# Before removing the old container, ensure Caddy resolves the new upstream and the public domain responds.
if [ -n "$CADDY_NET" ]; then
  OLD_CONTAINER_ID=$(docker compose ps -q "$OLD" || true)
  if [ -n "$OLD_CONTAINER_ID" ]; then
    OLD_NAME=$(docker inspect --format '{{.Name}}' "$OLD_CONTAINER_ID" | sed 's/\///')
    echo "Will disconnect old container $OLD_NAME from $CADDY_NET after confirming new upstream is live"
  fi
fi

# Verify switch worked (public domain check)
if curl -sf "https://$DOMAIN" > /dev/null; then
  echo "✅ New version responding correctly"
  # Now it's safe to remove the old container and disconnect its network alias
  if [ -n "$CADDY_NET" ] && [ -n "$OLD_CONTAINER_ID" ]; then
    echo "Disconnecting old container $OLD_NAME from $CADDY_NET"
    docker network disconnect "$CADDY_NET" "$OLD_NAME" || true
  fi

  echo "🗑️  Removing old container $OLD"
  docker compose rm -sf "$OLD"
else
  echo "⚠️  Warning: public domain health check failed; not removing old container to avoid downtime"
  echo "Old container(s) retained for manual inspection"
fi

# Direct container health check
NEW_PORT=$(docker port "$CONTAINER_NAME" 3000 2>/dev/null | cut -d: -f2 || echo "")

if [ -z "$NEW_PORT" ]; then
  rollback "Failed to get port mapping for new container"
fi

log_info "New container exposed on port: $NEW_PORT"
log_info "Running health checks..."

# Check container health
HEALTH_CHECK_PASSED=0
for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
  log_info "Health check attempt $i/$HEALTH_CHECK_RETRIES"
  
  # Get container status
  CONTAINER_STATUS=$(docker inspect "$CONTAINER_NAME" --format='{{.State.Status}}' 2>/dev/null || echo "unknown")
  
  # Check if container is still running (allow "starting" state during initial checks)
  if [ "$CONTAINER_STATUS" != "running" ] && [ "$i" -gt 3 ]; then
    rollback "Container stopped unexpectedly (status: $CONTAINER_STATUS)"
  fi
  
  # Try root endpoint
  if curl -sf --max-time 5 "http://localhost:$NEW_PORT" > /dev/null 2>&1; then
    log_success "✓ Root endpoint responding"
    HEALTH_CHECK_PASSED=1
    break
  fi
  
  # Try health endpoint
  if curl -sf --max-time 5 "http://localhost:$NEW_PORT/api/health" > /dev/null 2>&1; then
    log_success "✓ Health endpoint responding"
    HEALTH_CHECK_PASSED=1
    break
  fi
  
  if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
    rollback "Health checks failed after $HEALTH_CHECK_RETRIES attempts"
  fi
  
  sleep $HEALTH_CHECK_INTERVAL
done

if [ $HEALTH_CHECK_PASSED -eq 1 ]; then
  log_success "✅ $NEW is healthy and responding"
else
  rollback "Health check validation failed"
fi

# Wait for Caddy to detect the new upstream
log_info "⏳ Waiting for Caddy to detect new upstream..."
sleep $CADDY_SWITCH_WAIT

# Verify public domain access
log_info "Verifying public domain access: https://$DOMAIN"
PUBLIC_CHECK_PASSED=0

for i in $(seq 1 5); do
  if curl -sf --max-time 10 "https://$DOMAIN" > /dev/null 2>&1; then
    log_success "✅ Public domain responding correctly"
    PUBLIC_CHECK_PASSED=1
    break
  fi
  log_warn "Public domain check attempt $i/5 failed"
  sleep 2
done

if [ $PUBLIC_CHECK_PASSED -eq 0 ]; then
  log_warn "⚠️  Public domain health check failed - proceeding with caution"
  log_warn "Manual verification recommended: https://$DOMAIN"
fi

# ============================================================================
# Cleanup Old Container
# ============================================================================

if [ $PUBLIC_CHECK_PASSED -eq 1 ]; then
  log_info "Proceeding with old container removal"
  
  # Disconnect old container from network
  if [ -n "$CADDY_NET" ] && [ -n "${OLD_CONTAINER_ID:-}" ] && [ -n "${OLD_CONTAINER_NAME:-}" ]; then
    log_info "Disconnecting old container $OLD_CONTAINER_NAME from $CADDY_NET"
    docker network disconnect "$CADDY_NET" "$OLD_CONTAINER_NAME" 2>/dev/null || true
  fi

  # Remove old container
  log_info "🗑️  Removing old container: $OLD"
  if ! docker compose rm -sf "$OLD" 2>/dev/null; then
    log_warn "Failed to remove old container $OLD - may need manual cleanup"
  else
    log_success "Old container removed successfully"
  fi
else
  log_warn "⚠️  Public domain health check failed"
  log_warn "Old container $OLD retained for safety"
  log_warn "Please verify deployment and manually remove old container if needed:"
  log_warn "  docker compose rm -sf $OLD"
fi

# ============================================================================
# Finalize Deployment
# ============================================================================

# Update state file
echo "$NEXT" > "$STATE_FILE"
log_success "State file updated: $NEXT is now active"

log_success "✅ Deployment complete: $NEW is now serving traffic"

# Cleanup old images
log_info "Cleaning up unused Docker images..."
docker image prune -f > /dev/null 2>&1 || true

# Display final status
log_info ""
log_info "Current status:"
docker compose ps "$NEW" 2>/dev/null || true
log_info ""
log_success "Deployment finished successfully! 🎉"
