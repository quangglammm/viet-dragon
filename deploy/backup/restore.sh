#!/usr/bin/env bash
# Restores the database — and, from a backup set, the uploads volume.
#
#   restore.sh <stamp|latest>      database + uploads from /backups/<stamp>  (a verified backup made by backup.sh)
#   restore.sh --dump <file>       database only, from a `pg_dump -Fc` file  (the first load of the site: docs/deployment.md «Cutover»)
#
# Run it with the application STOPPED (`docker compose stop app`); it refuses while the app is connected.
#
# The live database is never modified until the restored copy is complete and checked:
#   1. the backup's checksums and archive are verified;
#   2. the dump is loaded into a SIDE database (one transaction), the application role's privileges are reasserted (a dump taken where that role
#      did not exist, like the seeded development database, carries none), and the row counts are compared with what the backup recorded;
#   3. the live database is renamed `<name>_before_restore_<time>` and the side database takes its name — instant, and undone if it fails;
#   4. only then is the uploads volume emptied and refilled from the archive.
# The old database stays until you drop it (the last line of the output says how).
set -Eeuo pipefail
# shellcheck source=lib.sh source-path=SCRIPTDIR
. /opt/backup/lib.sh

BACKUP_DIR=${BACKUP_DIR:-/backups}
UPLOADS_DIR=${UPLOADS_DIR:-/data/uploads}
APP_ROLE=${APP_DB_ROLE:-vietdragon_app}
: "${PGHOST:?} ${PGUSER:?} ${PGPASSWORD:?} ${PGDATABASE:?}"
LIVE=$PGDATABASE
SIDE="${LIVE}_restore"
ALLOW_UNVERIFIED=no
MODE=
SOURCE=

usage() { die "usage: restore.sh [--allow-unverified] <stamp|latest>   |   restore.sh --dump <file.dump>"; }

parse() {
  while [ $# -gt 0 ]; do
    case $1 in
      --allow-unverified) ALLOW_UNVERIFIED=yes ;;
      --dump)
        MODE=dump
        SOURCE=${2:-}
        shift
        ;;
      -*) usage ;;
      *)
        MODE=backup
        SOURCE=$1
        ;;
    esac
    shift
  done
  [ -n "$MODE" ] && [ -n "$SOURCE" ] || usage
}

sql() { psql -X -q -At -v ON_ERROR_STOP=1 -d "${DB:-postgres}" "$@"; }

prepare() {
  if [ "$MODE" = backup ]; then
    [ "$(id -u)" = 0 ] || die "run as root (the compose service does): the uploaded files must keep their owner"
    if [ "$SOURCE" = latest ]; then
      BACKUP=$(newest_verified)
      [ -n "$BACKUP" ] || die "there is no verified backup in $BACKUP_DIR"
    else
      BACKUP="$BACKUP_DIR/$SOURCE"
    fi
    [ -d "$BACKUP" ] || die "no such backup: $BACKUP"
    if [ ! -f "$BACKUP/VERIFIED" ] && [ "$ALLOW_UNVERIFIED" != yes ]; then
      die "$BACKUP was never verified — pass --allow-unverified only if you know why"
    fi
    log INFO "checking the backup $(basename "$BACKUP")"
    (cd "$BACKUP" && sha256sum -c SHA256SUMS >/dev/null) || die "checksum mismatch in $BACKUP — this backup is damaged"
    tar -tzf "$BACKUP/uploads.tar.gz" >/dev/null || die "the uploads archive of $BACKUP cannot be read"
    DUMP="$BACKUP/db.dump"
  else
    DUMP=$SOURCE
    [ -f "$DUMP" ] || die "no such file: $DUMP"
  fi
  pg_restore --list "$DUMP" >/dev/null || die "$DUMP is not a readable pg_dump custom-format file"

  [ "$(sql -c "select count(*) from pg_roles where rolname = '$APP_ROLE'")" = 1 ] || die "the role $APP_ROLE does not exist — start the stack once so db-init creates it"
  # «No database sessions» is NOT «not running»: the app's pool closes idle connections, so a running app usually has none. Ask the app itself
  # (this container shares its network; once the app is stopped its name no longer resolves), and look at the sessions as well.
  local app_url=${APP_HEALTH_URL:-http://app:3000/api/health}
  if wget -q -T 2 -O /dev/null "$app_url" 2>/dev/null; then
    die "the application is running (it answered $app_url) — stop it first: docker compose stop app"
  fi
  local sessions
  sessions=$(sql -c "select count(*) from pg_stat_activity where datname = '$LIVE' and usename = '$APP_ROLE'")
  [ "$sessions" = 0 ] || die "the application is connected to $LIVE ($sessions sessions) — stop it first: docker compose stop app"
}

restore_side_database() {
  log INFO "loading $(basename "$DUMP") into the side database $SIDE"
  sql -c "drop database if exists \"$SIDE\" with (force)"
  sql -c "create database \"$SIDE\""
  # --no-owner: objects belong to the role that restores them (the schema owner) whatever role owned them where the dump was made.
  pg_restore --dbname "$SIDE" --single-transaction --exit-on-error --no-owner "$DUMP"
  DB=$SIDE sql -v owner="$PGUSER" -v app_role="$APP_ROLE" -f /opt/backup/app-role-grants.sql >/dev/null
  DB=$SIDE sql -c "analyze" >/dev/null
  table_counts "$SIDE" >/tmp/counts.side
  if [ "$MODE" = backup ]; then
    if ! diff_counts "$BACKUP/counts.restored" /tmp/counts.side; then
      die "the restored copy does not have the row counts the backup recorded (above); $SIDE is left for inspection, nothing was changed"
    fi
    log INFO "the restored copy has exactly the row counts the backup recorded ($(wc -l </tmp/counts.side | tr -d ' ') tables)"
  fi
}

swap_databases() {
  OLD="${LIVE}_before_restore_$(date -u +%Y%m%d_%H%M%S)"
  log INFO "renaming $LIVE to $OLD and $SIDE to $LIVE"
  sql -c "alter database \"$LIVE\" rename to \"$OLD\""
  if ! sql -c "alter database \"$SIDE\" rename to \"$LIVE\""; then
    sql -c "alter database \"$OLD\" rename to \"$LIVE\"" || true
    die "could not put the restored database in place; the live database is as it was"
  fi
  sql -c "grant connect on database \"$LIVE\" to \"$APP_ROLE\""
}

restore_uploads() {
  log INFO "emptying $UPLOADS_DIR and unpacking uploads.tar.gz"
  find "$UPLOADS_DIR" -mindepth 1 -delete
  tar -C "$UPLOADS_DIR" -xzf "$BACKUP/uploads.tar.gz"
  # The archive restores each file's owner, but not the volume's root (the archive's "./" entry may not carry it on a volume created by another container).
  chown "${UPLOADS_OWNER:-1000:1000}" "$UPLOADS_DIR"
  local expected actual
  expected=$(tar -tzf "$BACKUP/uploads.tar.gz" | grep -vc '/$' || true)
  actual=$(find "$UPLOADS_DIR" -type f | wc -l | tr -d ' ')
  [ "$expected" = "$actual" ] || die "the archive holds $expected files but $actual are on the volume"
  log INFO "$actual uploaded files restored"
}

restore() {
  prepare
  restore_side_database
  swap_databases
  if [ "$MODE" = backup ]; then restore_uploads; fi
  log INFO "done. $LIVE now holds:"
  table_counts "$LIVE" | awk '{ printf "    %-45s %s\n", $1, $2 }' >&2
  log INFO "the previous database is kept as $OLD — once you are satisfied: docker compose exec db psql -U $PGUSER -d postgres -c 'drop database \"$OLD\"'"
}

parse "$@"
with_lock restore
