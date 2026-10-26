-- The privileges of the application role, written down once more so a restore can reassert them. Idempotent; run as the schema OWNER on the
-- restored database (restore.sh: psql -v owner=… -v app_role=… -f this file).
--
-- Why it exists: a dump only carries grants that existed in the database it was taken from. A backup of the production database has them, but
-- the dump the site is first loaded from (a seeded DEVELOPMENT database, docs/deployment.md «Cutover») was made where no `vietdragon_app` role
-- existed, so it carries none — and the app would answer «permission denied» on every table. This file is the single statement of what the
-- role may do; it mirrors deploy/db-init/01-app-role.sh (tables, sequences) and drizzle/0001_audit_log_append_only.sql (audit_log).
-- deploy/backup/grants.test.ts keeps it honest: no TRUNCATE, no DDL, audit_log append-only.

grant usage on schema public to :"app_role";
grant select, insert, update, delete on all tables in schema public to :"app_role";
grant usage, select on all sequences in schema public to :"app_role";

-- audit_log is append-only: the triggers bind every role, and the app role does not even hold the privileges (defence in depth).
revoke update, delete, truncate on audit_log from :"app_role";

-- Tables the owner creates later (a migration) are covered without a per-table grant, as in db-init.
alter default privileges for role :"owner" in schema public grant select, insert, update, delete on tables to :"app_role";
alter default privileges for role :"owner" in schema public grant usage, select on sequences to :"app_role";
