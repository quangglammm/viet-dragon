import { sql } from "drizzle-orm";
import { check, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { versioning } from "./columns";
import { localeRef } from "./foundations";

/**
 * UI copy: one JSON tree per (locale, namespace), read as deepMerge(messages/<locale>.json, db). The reserved
 * namespaces `seo` and `business` hold the site-wide facts (business name, address, social links, default Open
 * Graph image, JSON-LD Organization data) — see docs/data-model.md §11.5a.
 */
export const siteMessage = pgTable(
  "site_message",
  {
    locale: localeRef(),
    namespace: text("namespace").notNull(),
    data: jsonb("data").notNull(),
    ...versioning(),
  },
  (t) => [
    primaryKey({ columns: [t.locale, t.namespace] }),
    check("site_message_namespace_format", sql`${t.namespace} ~ '^[A-Za-z][A-Za-z0-9]*$'`),
    check("site_message_data_object", sql`jsonb_typeof(${t.data}) = 'object'`),
  ],
);
