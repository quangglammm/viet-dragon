#!/usr/bin/env bash
# The backup service: one verified backup every night at BACKUP_HOUR (local time in BACKUP_TZ), forever.
#
#   - On start, if no verified backup exists yet (a new stack, or the volume was lost), one is taken at once — otherwise the healthcheck would
#     have nothing to say for up to a day. BACKUP_ON_START=never turns that off.
#   - A failed backup is tried once more after BACKUP_RETRY_MINUTES; after that the next night's run is the next try. The failure is in the log and
#     in the healthcheck (docker compose ps) until a verified backup is newer than BACKUP_MAX_AGE_HOURS.
#   - Stops promptly on SIGTERM (`docker compose stop` must not wait out a sleep).
set -uo pipefail
# shellcheck source=lib.sh source-path=SCRIPTDIR
. /opt/backup/lib.sh

HOUR=${BACKUP_HOUR:-3}
TZ_NAME=${BACKUP_TZ:-Asia/Ho_Chi_Minh}
RETRY_MINUTES=${BACKUP_RETRY_MINUTES:-30}
BACKUP_DIR=${BACKUP_DIR:-/backups}

case $HOUR in '' | *[!0-9]*) die "BACKUP_HOUR must be a whole number of hours (0-23), got '$HOUR'" ;; esac
[ "$HOUR" -le 23 ] || die "BACKUP_HOUR must be 0-23, got '$HOUR'"
[ -f "/usr/share/zoneinfo/$TZ_NAME" ] || die "unknown BACKUP_TZ '$TZ_NAME'"

stop=no
trap 'stop=yes; [ -n "${sleeper:-}" ] && kill "$sleeper" 2>/dev/null' TERM INT

nap() { # seconds — an interruptible sleep
  sleep "$1" &
  sleeper=$!
  wait "$sleeper" 2>/dev/null
  sleeper=
}

attempt() {
  /opt/backup/backup.sh && return 0
  log ERROR "the backup failed; trying again in $RETRY_MINUTES minutes"
  nap $((RETRY_MINUTES * 60))
  [ "$stop" = yes ] && return 0
  /opt/backup/backup.sh || log ERROR "the backup failed again — the next try is tonight's run"
}

log INFO "backups: every day at $(printf '%02d' "$HOUR"):00 $TZ_NAME, into $BACKUP_DIR, keeping ${BACKUP_KEEP_DAYS:-14} days${BACKUP_RCLONE_REMOTE:+, copied to $BACKUP_RCLONE_REMOTE}"
touch /tmp/started

if [ "${BACKUP_ON_START:-if-missing}" != never ] && [ -z "$(newest_verified)" ]; then
  log INFO "no verified backup yet — taking one now"
  attempt
fi

while [ "$stop" = no ]; do
  delay=$(seconds_until_hour "$HOUR" "$(local_seconds_of_day "$TZ_NAME")")
  log INFO "next backup in $((delay / 3600)) h $((delay % 3600 / 60)) min"
  nap "$delay"
  [ "$stop" = yes ] && break
  attempt
done
log INFO "stopping"
