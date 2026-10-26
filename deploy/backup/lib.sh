#!/usr/bin/env bash
# Shared helpers of the backup image. Sourced by backup.sh, verify.sh, restore.sh, entrypoint.sh and healthcheck.sh.
#
# The functions that decide something (when to run, what to delete, whether two row counts agree) are pure — they read their arguments and
# stdin and print — so deploy/backup/lib.test.ts can run them through bash without a database. The ones that touch Postgres or the volumes
# are at the bottom and are exercised by the restore drill (docs/deployment.md).

STAMP_FORMAT='+%Y%m%dT%H%M%SZ'
SECONDS_PER_DAY=86400

log() { # level message...
  local level=$1
  shift
  printf '%s [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$level" "$*" >&2
}
die() {
  log ERROR "$*"
  exit 1
}

# ───────────── pure ─────────────

# Backup directory names are UTC timestamps, so name order is time order.
stamp_from_epoch() { # epoch-seconds
  date -u -d "@$1" "$STAMP_FORMAT" 2>/dev/null || date -u -r "$1" "$STAMP_FORMAT" # GNU and busybox, then BSD (a developer's Mac)
}
stamp_now() { stamp_from_epoch "$(date +%s)"; }

# Seconds to sleep from `now` (seconds since local midnight) until the next HOUR:00:00. Never 0: a backup that finishes at the very
# second it was due must not run again at once.
seconds_until_hour() { # hour now-seconds-of-day
  local hour=$1 now=$2
  local delay=$(((hour * 3600 - now + SECONDS_PER_DAY) % SECONDS_PER_DAY))
  if [ "$delay" -eq 0 ]; then delay=$SECONDS_PER_DAY; fi
  printf '%s\n' "$delay"
}
local_seconds_of_day() { # timezone
  local h m s
  h=$(TZ=$1 date +%H) m=$(TZ=$1 date +%M) s=$(TZ=$1 date +%S)
  printf '%s\n' $((10#$h * 3600 + 10#$m * 60 + 10#$s))
}

# Reads backup stamps on stdin (any order), prints the ones to delete: older than the cutoff AND not among the newest `keep-min` —
# so a long run of failed backups can never leave the host with none.
expired_backups() { # cutoff-stamp keep-min
  local cutoff=$1 keep_min=$2
  sort | awk -v cutoff="$cutoff" -v keep="$keep_min" '{ names[NR] = $0 } END { for (i = 1; i <= NR - keep; i++) if (names[i] < cutoff) print names[i] }'
}

# Row counts are files of `schema.table count` lines. A backup is a faithful copy when each table of the restored copy has a count between
# the count taken just before the dump and just after it (the database is live while pg_dump runs: a table may grow in between).
# Prints one line per disagreement and fails if there is any; a table missing from either side is a disagreement.
compare_counts() { # before-file after-file restored-file
  awk '
    function note(name) { if (!(name in names)) { names[name] = 1; tables++ } }
    FILENAME == ARGV[1] { before[$1] = $2; note($1); next }
    FILENAME == ARGV[2] { after[$1] = $2; note($1); next }
    { restored[$1] = $2; note($1) }
    END {
      # Comparing nothing proves nothing: if no table was counted anywhere, counting itself failed.
      if (tables == 0) { print "no tables were counted"; exit 1 }
      bad = 0
      for (name in names) {
        if (!(name in before) || !(name in after)) { printf "%s: not counted before and after the dump\n", name; bad = 1; continue }
        if (!(name in restored)) { printf "%s: missing from the restored copy\n", name; bad = 1; continue }
        low = before[name] + 0; high = after[name] + 0
        if (low > high) { t = low; low = high; high = t }
        if (restored[name] + 0 < low || restored[name] + 0 > high) { printf "%s: restored %s, source had %s..%s\n", name, restored[name], low, high; bad = 1 }
      }
      exit bad
    }' "$@"
}

# Two exact count files (a restore compared with the counts the backup recorded for its restored copy).
diff_counts() { # expected-file actual-file
  diff <(sort "$1") <(sort "$2")
}

# ───────────── database ─────────────

# Needs PGHOST, PGUSER, PGPASSWORD in the environment. Prints `schema.table count` for every ordinary table, sorted.
table_counts() { # database
  psql -X -At -F ' ' -d "$1" -v ON_ERROR_STOP=1 <<'SQL' | sort
select format('select %L, count(*) from %I.%I', n.nspname || '.' || c.relname, n.nspname, c.relname)
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('r', 'p') and n.nspname not in ('pg_catalog', 'information_schema') and n.nspname !~ '^pg_toast'
order by 1
\gexec
SQL
}

with_lock() { # command...   — one backup or restore at a time, across containers (the backups volume is shared)
  exec 9>"${BACKUP_DIR:-/backups}/.lock"
  flock -n 9 || die "another backup or restore is running — try again when it has finished"
  "$@"
}

newest_verified() { # prints the newest backup directory that carries a VERIFIED marker, or nothing
  local dir
  for dir in $(find "${BACKUP_DIR:-/backups}" -mindepth 1 -maxdepth 1 -type d -name '[0-9]*Z' | sort -r); do
    if [ -f "$dir/VERIFIED" ]; then
      printf '%s\n' "$dir"
      return 0
    fi
  done
}
