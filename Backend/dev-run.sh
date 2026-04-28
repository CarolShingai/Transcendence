#!/bin/sh
set -eu

cd /workspace
chmod +x ./gradlew

APP_PID=""
LAST_HASH=""

compute_hash() {
  {
    find src/main src/test -type f 2>/dev/null | sort
    [ -f build.gradle.kts ] && echo build.gradle.kts
    [ -f settings.gradle.kts ] && echo settings.gradle.kts
  } | xargs cat 2>/dev/null | md5sum | awk '{print $1}'
}

start_app() {
  echo "[dev-run] starting Spring Boot..."
  ./gradlew --no-daemon bootRun --args=--server.port=8080 &
  APP_PID=$!
}

stop_app() {
  if [ -n "$APP_PID" ] && kill -0 "$APP_PID" 2>/dev/null; then
    echo "[dev-run] stopping Spring Boot..."
    kill "$APP_PID" 2>/dev/null || true
    wait "$APP_PID" 2>/dev/null || true
  fi
  APP_PID=""
}

trap 'stop_app; exit 0' INT TERM

LAST_HASH="$(compute_hash)"
start_app

while true; do
  sleep 2
  NEW_HASH="$(compute_hash)"
  if [ "$NEW_HASH" != "$LAST_HASH" ]; then
    echo "[dev-run] source change detected, restarting..."
    LAST_HASH="$NEW_HASH"
    stop_app
    start_app
  elif [ -n "$APP_PID" ] && ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "[dev-run] app process exited, restarting..."
    start_app
  fi
done
