#!/bin/sh
# Runs once, when the Postgres data volume is first created (docker-entrypoint-initdb.d).
#
# POSTGRES_USER owns the schema and runs migrations. The app connects as `vietdragon_app`, which
# can only read and write rows: no DDL, no TRUNCATE, no ownership. Tables the owner creates later
# are covered by the default privileges below, so migrations need no per-table GRANT.
#
# To change the app password afterwards: ALTER ROLE vietdragon_app PASSWORD '...' (this script
# does not run again against an existing volume).
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v owner="$POSTGRES_USER" -v dbname="$POSTGRES_DB" -v app_password="$APP_DB_PASSWORD" <<'SQL'
create role vietdragon_app login password :'app_password'
  nosuperuser nocreatedb nocreaterole noinherit;
grant connect on database :"dbname" to vietdragon_app;
grant usage on schema public to vietdragon_app;
alter default privileges for role :"owner" in schema public
  grant select, insert, update, delete on tables to vietdragon_app;
alter default privileges for role :"owner" in schema public
  grant usage, select on sequences to vietdragon_app;
SQL
