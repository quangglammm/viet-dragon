import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

// Single source of truth for who may do what. The admin plugin enforces these on its own
// endpoints (user management); `can()` lets our DAL and UI ask the same question.
const statements = {
  ...defaultStatements,
  content: ["edit", "publish"],
  media: ["upload", "delete"],
  audit: ["read"],
} as const;

export const ac = createAccessControl(statements);

// `user:delete` and every `impersonate*` action are left out of ALL roles on purpose:
// accounts are deactivated (banned), never deleted — authorship foreign keys depend on it —
// and nobody acts as someone else.
export const roles = {
  admin: ac.newRole({
    user: ["create", "list", "get", "update", "set-role", "set-password", "ban"],
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

type Resource = keyof typeof statements;
type Action<R extends Resource> = (typeof statements)[R][number];

function isRole(value: string): value is Role {
  return Object.hasOwn(roles, value);
}

/** The admin plugin stores several roles comma-separated; any one of them may grant the action. */
export function can<R extends Resource>(role: string | null | undefined, resource: R, action: Action<R>): boolean {
  if (!role) return false;
  return role
    .split(",")
    .map((part) => part.trim())
    .some((name) => isRole(name) && roles[name].authorize({ [resource]: [action] }).success);
}
