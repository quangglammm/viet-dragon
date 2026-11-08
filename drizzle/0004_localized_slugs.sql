-- One slug per language. product_slug, product_segment and post_slug gain a `locale` column and a primary key that includes it;
-- category_slug is new. The commit-time rules ("every product has a canonical slug in every language"…) are in
-- 0005_localized_slug_integrity.sql.
--
-- HAND-EDITED after drizzle-kit generated it: (1) the guard below, (2) the statements are reordered — the generated file added the
-- new primary keys before the `locale` column existed, and (3) post_slug's old primary key (an unnamed, column-level one) is dropped
-- under its Postgres default name, which drizzle-kit could not work out.
--
-- The new NOT NULL column has no default and there is no backfill: nothing is deployed with content in these tables yet.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM category) OR EXISTS (SELECT 1 FROM product) OR EXISTS (SELECT 1 FROM post) THEN
    RAISE EXCEPTION 'The content tables hold data, and this migration restructures the slug tables (one slug per language) without a backfill. Reset the content database (drop it, run the migrations again) and run "pnpm seed".';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "product_slug" ADD COLUMN "locale" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product_segment" ADD COLUMN "locale" text NOT NULL;--> statement-breakpoint
ALTER TABLE "post_slug" ADD COLUMN "locale" text NOT NULL;--> statement-breakpoint
DROP INDEX "product_slug_one_canonical";--> statement-breakpoint
DROP INDEX "product_segment_one_canonical_shape";--> statement-breakpoint
DROP INDEX "product_segment_one_canonical_option";--> statement-breakpoint
DROP INDEX "post_slug_one_canonical";--> statement-breakpoint
ALTER TABLE "product_slug" DROP CONSTRAINT "product_slug_category_id_slug_pk";--> statement-breakpoint
ALTER TABLE "product_segment" DROP CONSTRAINT "product_segment_product_id_slug_pk";--> statement-breakpoint
ALTER TABLE "post_slug" DROP CONSTRAINT "post_slug_pkey";--> statement-breakpoint
CREATE TABLE "category_slug" (
	"locale" text NOT NULL,
	"slug" text NOT NULL,
	"category_id" text NOT NULL,
	"is_canonical" boolean DEFAULT false NOT NULL,
	CONSTRAINT "category_slug_locale_slug_pk" PRIMARY KEY("locale","slug"),
	CONSTRAINT "category_slug_slug_format" CHECK ("category_slug"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "product_slug" ADD CONSTRAINT "product_slug_locale_category_id_slug_pk" PRIMARY KEY("locale","category_id","slug");--> statement-breakpoint
ALTER TABLE "product_segment" ADD CONSTRAINT "product_segment_product_id_locale_slug_pk" PRIMARY KEY("product_id","locale","slug");--> statement-breakpoint
ALTER TABLE "post_slug" ADD CONSTRAINT "post_slug_locale_slug_pk" PRIMARY KEY("locale","slug");--> statement-breakpoint
ALTER TABLE "category_slug" ADD CONSTRAINT "category_slug_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_slug" ADD CONSTRAINT "category_slug_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_slug" ADD CONSTRAINT "product_slug_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_segment" ADD CONSTRAINT "product_segment_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_slug" ADD CONSTRAINT "post_slug_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_one_canonical" ON "category_slug" USING btree ("category_id","locale") WHERE "category_slug"."is_canonical";--> statement-breakpoint
CREATE INDEX "category_slug_category_idx" ON "category_slug" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_one_canonical" ON "product_slug" USING btree ("product_id","locale") WHERE "product_slug"."is_canonical";--> statement-breakpoint
CREATE UNIQUE INDEX "product_segment_one_canonical_shape" ON "product_segment" USING btree ("shape_id","locale") WHERE "product_segment"."is_canonical" and "product_segment"."shape_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "product_segment_one_canonical_option" ON "product_segment" USING btree ("option_id","locale") WHERE "product_segment"."is_canonical" and "product_segment"."option_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "post_slug_one_canonical" ON "post_slug" USING btree ("post_id","locale") WHERE "post_slug"."is_canonical";
