-- audit_log is append-only: nothing may rewrite or erase history, not even the application role.
-- The triggers bind every role (the owner too, until a migration deliberately drops them), so they
-- hold in the single-role dev database as well. The REVOKE is defence in depth and only runs where
-- the DML-only app role exists (deploy/db-init/01-app-role.sh creates it in the production stack).
-- The function is named audit_log_immutable() so it cannot collide with docs/data-model.sql's forbid_truncate().
CREATE FUNCTION audit_log_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only (% is not allowed)', TG_OP USING ERRCODE = '42501';
END $$;
--> statement-breakpoint
CREATE TRIGGER audit_log_no_update_delete BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();
--> statement-breakpoint
CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_immutable();
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vietdragon_app') THEN
    REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM vietdragon_app;
  END IF;
END $$;
