#!/usr/bin/env bash
# One backup of the database and the uploads volume.
#
#   /backups/<stamp>/db.dump          pg_dump -Fc of the whole database (schema, data, grants, triggers)
#   /backups/<stamp>/uploads.tar.gz   the uploads volume — taken AFTER the dump, so every `media` row in the dump has its file
#   /backups/<stamp>/counts.*         row counts around the dump and of the verification restore
#   /backups/<stamp>/SHA256SUMS       checksums of the files above (restore.sh checks them first)
#   /backups/<stamp>/VERIFIED         written only after the dump was restored into a scratch database and agreed with the live one
#
# The directory is built under <stamp>.partial and renamed once it is verified, so a half-written or unverified backup never has the name of a
# good one. Off-box copy (rclone) and rotation follow. Exit 0 only for a verified backup.
set -Eeuo pipefail
# shellcheck source=lib.sh source-path=SCRIPTDIR
. /opt/backup/lib.sh

BACKUP_DIR=${BACKUP_DIR:-/backups}
UPLOADS_DIR=${UPLOADS_DIR:-/data/uploads}
KEEP_DAYS=${BACKUP_KEEP_DAYS:-14}
KEEP_MIN=${BACKUP_KEEP_MIN:-3}
: "${PGHOST:?} ${PGUSER:?} ${PGPASSWORD:?} ${PGDATABASE:?}"

run() {
  local stamp work
  stamp=$(stamp_now)
  work="$BACKUP_DIR/$stamp.partial"
  mkdir "$work"
  # A failure leaves the partial directory for inspection (rotation removes it after a day) — and never the name of a good backup.
  trap 'log ERROR "backup $stamp failed — what was written is in $work"' ERR

  log INFO "backup $stamp: dumping $PGDATABASE"
  table_counts "$PGDATABASE" >"$work/counts.before"
  pg_dump --format=custom --dbname "$PGDATABASE" --file "$work/db.dump"
  table_counts "$PGDATABASE" >"$work/counts.after"

  log INFO "backup $stamp: archiving $UPLOADS_DIR"
  tar -C "$UPLOADS_DIR" -czf "$work/uploads.tar.gz" .

  (cd "$work" && sha256sum db.dump uploads.tar.gz counts.before counts.after >SHA256SUMS)
  /opt/backup/verify.sh "$work"
  (cd "$work" && sha256sum counts.restored >>SHA256SUMS)

  printf '{"stamp":"%s","database":"%s","dumpBytes":%s,"uploadsBytes":%s,"tables":%s,"postgres":"%s"}\n' \
    "$stamp" "$PGDATABASE" "$(wc -c <"$work/db.dump" | tr -d ' ')" "$(wc -c <"$work/uploads.tar.gz" | tr -d ' ')" \
    "$(wc -l <"$work/counts.restored" | tr -d ' ')" "$(pg_dump --version | cut -d' ' -f3)" >"$work/manifest.json"

  touch "$work/VERIFIED"
  mv "$work" "$BACKUP_DIR/$stamp"
  trap - ERR
  log INFO "backup $stamp: verified ($(du -sh "$BACKUP_DIR/$stamp" | cut -f1))"

  push_offsite "$BACKUP_DIR/$stamp" || true
  rotate
}

# Optional second copy elsewhere (BACKUP_RCLONE_REMOTE=name:bucket/path, the remote itself configured by RCLONE_CONFIG_<NAME>_* variables).
# A failed push does not undo the local backup; it leaves OFFSITE_FAILED, which the healthcheck reports.
push_offsite() { # backup-dir
  [ -n "${BACKUP_RCLONE_REMOTE:-}" ] || return 0
  local dir=$1 name
  name=$(basename "$dir")
  log INFO "backup $name: copying to $BACKUP_RCLONE_REMOTE"
  local output
  # rclone repeats its error once per file and per attempt: keep its output and report the cause once.
  if output=$(rclone copy "$dir" "$BACKUP_RCLONE_REMOTE/$name" --checksum --retries 3 2>&1); then
    rm -f "$dir/OFFSITE_FAILED"
    touch "$dir/OFFSITE_OK"
  else
    touch "$dir/OFFSITE_FAILED"
    log ERROR "backup $name: the off-box copy failed — the local backup is intact. rclone said: $(printf '%s\n' "$output" | tail -n 2 | tr '\n' ' ')"
    return 1
  fi
}

rotate() {
  local cutoff name
  cutoff=$(stamp_from_epoch $(($(date +%s) - KEEP_DAYS * SECONDS_PER_DAY)))
  # Complete backups: keep the newest KEEP_MIN whatever their age, delete the others older than KEEP_DAYS.
  for name in $(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '[0-9]*Z' | sed 's#.*/##' | expired_backups "$cutoff" "$KEEP_MIN"); do
    log INFO "rotate: removing $name"
    rm -rf "${BACKUP_DIR:?}/$name"
  done
  # Leftovers of failed runs: kept a day for inspection.
  find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '*.partial' -mmin +1440 -exec rm -rf {} + 2>/dev/null || true
}

with_lock run
