#!/usr/bin/env bash
# Healthy = the newest VERIFIED backup is younger than BACKUP_MAX_AGE_HOURS (26: a nightly job plus slack), and — when an off-box copy is
# configured — that backup reached it. `docker compose ps` shows the result, so a stopped or failing backup is seen without reading logs.
set -uo pipefail

BACKUP_DIR=${BACKUP_DIR:-/backups}
MAX_AGE_MINUTES=$((${BACKUP_MAX_AGE_HOURS:-26} * 60))

newest=$(find "$BACKUP_DIR" -mindepth 2 -maxdepth 2 -name VERIFIED -mmin "-$MAX_AGE_MINUTES" | sort | tail -n 1)
if [ -z "$newest" ]; then
  echo "no verified backup in the last ${BACKUP_MAX_AGE_HOURS:-26} hours" >&2
  exit 1
fi
if [ -n "${BACKUP_RCLONE_REMOTE:-}" ] && [ ! -f "$(dirname "$newest")/OFFSITE_OK" ]; then
  echo "the newest verified backup ($(basename "$(dirname "$newest")")) has not reached $BACKUP_RCLONE_REMOTE" >&2
  exit 1
fi
echo "newest verified backup: $(basename "$(dirname "$newest")")"
