# syntax=docker/dockerfile:1
#
# The backup / restore image: pg_dump, pg_restore and psql of the SAME major version as the database (17), plus rclone for the optional off-box copy.
# One image, three jobs (compose.yaml): `backup` (a scheduler, nightly), `restore` (a one-shot under profile `tools`) and ad-hoc `exec`s.
FROM postgres:17-alpine

# /data/uploads exists here, owned by the app's user (uid 1000, `node` in the app image), for one reason: a NEW named volume takes its owner from the image
# path of the FIRST container that mounts it. If the backup or restore container did that without this directory, the uploads volume would be root-owned
# and the app could not create a new year's folder. (restore.sh also sets the owner explicitly.)
RUN apk add --no-cache bash rclone tzdata \
 && mkdir -p /opt/backup /backups /data/uploads \
 && chown postgres:postgres /backups \
 && chown 1000:1000 /data/uploads
COPY --chmod=0755 lib.sh backup.sh verify.sh restore.sh entrypoint.sh healthcheck.sh /opt/backup/
COPY --chmod=0644 app-role-grants.sql /opt/backup/
# Short names for `docker compose exec backup backup` and `… run --rm restore latest`.
RUN ln -s /opt/backup/backup.sh /usr/local/bin/backup && ln -s /opt/backup/verify.sh /usr/local/bin/verify && ln -s /opt/backup/restore.sh /usr/local/bin/restore

# Fail the BUILD if a tool the scripts depend on is missing (busybox in alpine has flock, tar -z and date -d @N; the check proves it).
RUN bash -c 'for tool in pg_dump pg_restore psql rclone flock tar sha256sum find comm awk sed; do command -v "$tool" >/dev/null || { echo "missing: $tool" >&2; exit 1; }; done; date -u -d @0 +%Y >/dev/null; echo "tools present"'

ENV HOME=/tmp BACKUP_DIR=/backups UPLOADS_DIR=/data/uploads
USER postgres
HEALTHCHECK --interval=10m --timeout=30s --start-period=15m --retries=1 CMD ["/opt/backup/healthcheck.sh"]
ENTRYPOINT ["/opt/backup/entrypoint.sh"]
# The postgres base image's default command is `postgres`; with an entrypoint of ours it would arrive as an argument.
CMD []
# The base image also declares VOLUME /var/lib/postgresql/data, which would make compose create an anonymous volume nobody uses: compose.yaml mounts a tmpfs there.
