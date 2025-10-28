#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  printf '[start-dev] %s\n' "$1"
}

ensure_executable() {
  local file="$1"
  if [ ! -x "$file" ]; then
    chmod +x "$file"
  fi
}

free_port() {
  local port=$1
  if lsof -ti tcp:"$port" >/dev/null 2>&1; then
    log "Port $port is in use. Terminating existing process..."
    lsof -ti tcp:"$port" | xargs -r kill -9
    sleep 1
  fi
}

start_frontend() {
  log 'Starting Vite dev server in my-react-app...'
  cd "$ROOT_DIR/my-react-app"
  npm run dev
}

start_proxy() {
  free_port 3001
  log 'Starting Zeno proxy server...'
  cd "$ROOT_DIR/zeno-proxy-server"
  npm run dev
}

start_backend() {
  log 'Starting Spring Boot backend...'
  cd "$ROOT_DIR/e-payment1"
  ensure_executable ./mvnw
  ./mvnw spring-boot:run
}

start_frontend &
FRONTEND_PID=$!

start_proxy &
PROXY_PID=$!

start_backend &
BACKEND_PID=$!

trap 'log "Shutting down..."; kill $FRONTEND_PID $PROXY_PID $BACKEND_PID 2>/dev/null || true' EXIT INT TERM

log "All services launched. Frontend PID: $FRONTEND_PID, Proxy PID: $PROXY_PID, Backend PID: $BACKEND_PID"

wait
