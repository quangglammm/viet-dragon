import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// app-role-grants.sql is what restore.sh runs to give the application role its privileges again after a restore — and a dump of the seeded development
// database has none to give back. It must say exactly what deploy/db-init and migration 0001 say, and never more: this file is the guard.

const read = (...parts: string[]) => readFileSync(join(__dirname, "..", "..", ...parts), "utf8");
const grants = read("deploy", "backup", "app-role-grants.sql");
const statements = grants
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((statement) => statement.replace(/\s+/g, " ").trim().toLowerCase())
  .filter(Boolean);

describe("app-role-grants.sql", () => {
  it("grants the application role row access to tables and sequences, nothing more", () => {
    expect(statements).toContain('grant select, insert, update, delete on all tables in schema public to :"app_role"');
    expect(statements).toContain('grant usage, select on all sequences in schema public to :"app_role"');
    expect(statements).toContain('grant usage on schema public to :"app_role"');
  });

  it("never grants TRUNCATE, DDL, ownership or any role", () => {
    const granting = statements.filter((statement) => statement.startsWith("grant") || statement.includes("grant select"));
    for (const statement of granting) expect(statement, statement).not.toMatch(/truncate|references|trigger|create|all privileges|\ball\b(?! tables| sequences)|superuser|createdb|createrole|owner to/);
    expect(grants.toLowerCase()).not.toMatch(/alter role|create role|drop |alter table|owner to/);
  });

  it("keeps audit_log append-only: the app role loses UPDATE, DELETE and TRUNCATE on it", () => {
    expect(statements).toContain('revoke update, delete, truncate on audit_log from :"app_role"');
    // and the revoke comes AFTER the blanket grant, or it would be undone
    expect(statements.indexOf('revoke update, delete, truncate on audit_log from :"app_role"')).toBeGreaterThan(statements.indexOf('grant select, insert, update, delete on all tables in schema public to :"app_role"'));
  });

  it("states the same default privileges as deploy/db-init, so tables created by a later migration are covered", () => {
    const init = read("deploy", "db-init", "01-app-role.sh").replace(/\s+/g, " ").toLowerCase();
    expect(init).toContain("grant select, insert, update, delete on tables to vietdragon_app");
    expect(init).toContain("grant usage, select on sequences to vietdragon_app");
    expect(statements).toContain('alter default privileges for role :"owner" in schema public grant select, insert, update, delete on tables to :"app_role"');
    expect(statements).toContain('alter default privileges for role :"owner" in schema public grant usage, select on sequences to :"app_role"');
  });

  it("is the same audit_log restriction that migration 0001 applies", () => {
    expect(read("drizzle", "0001_audit_log_append_only.sql")).toMatch(/REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM vietdragon_app/);
  });
});
