import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Single source of truth for who may do what. The admin plugin enforces these on its own
// endpoints (user management); `can()` / `hasPermission()` let our DAL and UI ask the same question.
const statements = {
  ...defaultStatements,
  content: ["edit", "publish"],
  media: ["upload", "delete"],
  audit: ["read"],
} as const;

export const ac = createAccessControl(statements);

// Deliberately absent from EVERY role:
// - `user:delete` — accounts are deactivated (banned), never deleted; authorship foreign keys depend on it.
// - `user:impersonate*` — nobody acts as someone else.
// - `user:update` — the admin plugin's update-user can rewrite `role` / `banned`, which would bypass the
//   guards on set-role and ban-user (self-action rule, session freshness, audit). Nothing needs it.
export const roles = {
  admin: ac.newRole({
    user: ["create", "list", "get", "set-role", "set-password", "ban"],
    session: ["list", "revoke"],
    content: ["edit", "publish"],
    media: ["upload", "delete"],
    audit: ["read"],
  }),
  editor: ac.newRole({
    content: ["edit", "publish"],
    media: ["upload"],
  }),
};

export type Role = keyof typeof roles;
export const DEFAULT_ROLE: Role = "editor";

/** Admin UI is Vietnamese-only; this is the one place role names are spelled out for people. */
export const ROLE_LABELS: Record<Role, string> = { admin: "Quản trị viên", editor: "Biên tập viên" };
export const ROLE_NAMES = Object.keys(roles) as Role[];

export type Resource = keyof typeof statements;
type Action<R extends Resource> = (typeof statements)[R][number];
/** A `[resource, action]` pair, typed so each action belongs to its resource. */
export type Permission = { [R in Resource]: readonly [R, Action<R>] }[Resource];

export function isRole(value: string): value is Role {
  return Object.hasOwn(roles, value);
}

/** "Quản trị viên" for a stored role value (which may hold several, comma-separated). */
export function roleLabel(role: string | null | undefined): string {
  if (!role) return "Chưa phân quyền";
  return role
    .split(",")
    .map((part) => part.trim())
    .map((name) => (isRole(name) ? ROLE_LABELS[name] : name))
    .join(", ");
}

/** The admin plugin stores several roles comma-separated; any one of them may grant the action. */
function check(role: string | null | undefined, resource: Resource, action: string): boolean {
  if (!role) return false;
  return role
    .split(",")
    .map((part) => part.trim())
    .some((name) => isRole(name) && roles[name].authorize({ [resource]: [action] }).success);
}

export function can<R extends Resource>(role: string | null | undefined, resource: R, action: Action<R>): boolean {
  return check(role, resource, action);
}

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  return check(role, permission[0], permission[1]);
}

/** True when any of the (comma-separated) roles is `admin`. */
export function isAdminRole(role: string | null | undefined): boolean {
  return !!role && role.split(",").some((part) => part.trim() === "admin");
}
