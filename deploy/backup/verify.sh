#!/usr/bin/env bash
# Proves that a backup directory can be restored: loads its dump into a scratch database, compares the row counts with the counts taken from the
# live database around the dump, and checks that every uploaded picture the restored `media` table names is in the archive.
# Writes counts.restored next to the dump (restore.sh compares its own restore with it). Exit 0 only if everything agrees.
#
#   verify.sh <backup-dir>
set -euo pipefail
# shellcheck source=lib.sh source-path=SCRIPTDIR
. /opt/backup/lib.sh

dir=${1:?usage: verify.sh <backup-dir>}
[ -f "$dir/db.dump" ] && [ -f "$dir/uploads.tar.gz" ] || die "$dir does not hold a db.dump and an uploads.tar.gz"

scratch="vd_verify_$(date -u +%s)_$$"
cleanup() { psql -X -q -d postgres -c "drop database if exists \"$scratch\" with (force)" >/dev/null 2>&1 || true; }
trap cleanup EXIT

log INFO "verify: restoring $(basename "$dir")/db.dump into the scratch database $scratch"
psql -X -q -d postgres -v ON_ERROR_STOP=1 -c "create database \"$scratch\""
# The same flags restore.sh uses, so what is proven here is what a real restore does.
pg_restore --dbname "$scratch" --single-transaction --exit-on-error "$dir/db.dump"

table_counts "$scratch" >"$dir/counts.restored"
if ! compare_counts "$dir/counts.before" "$dir/counts.after" "$dir/counts.restored"; then
  die "verify: the restored copy does not match the live database (see above)"
fi
log INFO "verify: $(wc -l <"$dir/counts.restored" | tr -d ' ') tables, every row count agrees"

# Every picture a row names must be in the archive (backup.sh dumps first and archives second, so a file can only be missing if it was deleted in
# between — then run the backup again). Keys look like uploads/2026/x.webp and live at <volume>/2026/x.webp, which the archive lists as ./2026/x.webp.
tar -tzf "$dir/uploads.tar.gz" | sed 's#^\./##' | sort >"$dir/.archive-files"
psql -X -At -d "$scratch" -c "select substr(storage_key, 9) from media where source = 'upload' order by 1" >"$dir/.row-files"
missing=$(comm -13 "$dir/.archive-files" "$dir/.row-files" | wc -l | tr -d ' ')
rows=$(wc -l <"$dir/.row-files" | tr -d ' ')
rm -f "$dir/.archive-files" "$dir/.row-files"
if [ "$missing" -ne 0 ]; then
  die "verify: $missing of $rows uploaded pictures named by the database are not in the archive"
fi
log INFO "verify: $rows uploaded pictures, all in the archive"
