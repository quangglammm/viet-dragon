import { asc } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";

/** Account id → display name, for «bởi …» in the history. A print shop has a handful of staff; accounts are deactivated, never deleted. */
export async function listAuthorNames(x: DbExecutor): Promise<Record<string, string>> {
  const rows = await x.select({ id: schema.app_user.id, name: schema.app_user.name }).from(schema.app_user).orderBy(asc(schema.app_user.createdAt));
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}
