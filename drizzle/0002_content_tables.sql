-- HAND-ADDED above the generated DDL: the CHECK constraints below call nonblank(), so it must exist first. The
-- remaining functions and all triggers are in 0003_content_integrity.sql. Everything from the first CREATE TABLE
-- on is drizzle-kit output (lib/db/content/*).
-- True when the text has something other than whitespace in ANY script: plain btrim() misses tab, newline, NBSP,
-- U+3000, zero-width space and the BOM. Written with \u escapes (Postgres regex syntax) so the set is reviewable.
CREATE FUNCTION nonblank(t text) RETURNS boolean LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
$$ SELECT t IS NOT NULL AND regexp_replace(t, '[\s\u00a0\u1680\u180e\u2000-\u200f\u2028-\u202f\u205f-\u2064\u3000\ufeff]+', '', 'g') <> '' $$;--> statement-breakpoint
CREATE TABLE "locale" (
	"code" text PRIMARY KEY NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"position" smallint NOT NULL,
	CONSTRAINT "locale_code_format" CHECK ("locale"."code" ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
	CONSTRAINT "locale_position_nonneg" CHECK ("locale"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"source" text NOT NULL,
	"backend" text DEFAULT 'local' NOT NULL,
	"storage_key" text NOT NULL,
	"kind" text NOT NULL,
	"mime" text NOT NULL,
	"width" integer,
	"height" integer,
	"bytes" bigint NOT NULL,
	"sha256" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key"),
	CONSTRAINT "media_id_kind_unique" UNIQUE("id","kind"),
	CONSTRAINT "media_source_valid" CHECK ("media"."source" in ('static','upload')),
	CONSTRAINT "media_backend_valid" CHECK ("media"."backend" in ('local','s3')),
	CONSTRAINT "media_kind_valid" CHECK ("media"."kind" in ('image','video')),
	CONSTRAINT "media_storage_key_nonblank" CHECK (nonblank("media"."storage_key")),
	CONSTRAINT "media_width_positive" CHECK ("media"."width" > 0),
	CONSTRAINT "media_height_positive" CHECK ("media"."height" > 0),
	CONSTRAINT "media_bytes_nonneg" CHECK ("media"."bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media_i18n" (
	"media_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"alt" text NOT NULL,
	CONSTRAINT "media_i18n_media_id_locale_pk" PRIMARY KEY("media_id","locale"),
	CONSTRAINT "media_i18n_alt_nonblank" CHECK (nonblank("media_i18n"."alt"))
);
--> statement-breakpoint
CREATE TABLE "material" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "material_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"icon" text,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "material_slug_unique" UNIQUE("slug"),
	CONSTRAINT "material_slug_format" CHECK ("material"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "material_icon_format" CHECK ("material"."icon" is null or "material"."icon" ~ '^[A-Za-z0-9]+$')
);
--> statement-breakpoint
CREATE TABLE "material_i18n" (
	"material_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "material_i18n_material_id_locale_pk" PRIMARY KEY("material_id","locale"),
	CONSTRAINT "material_i18n_name_nonblank" CHECK (nonblank("material_i18n"."name"))
);
--> statement-breakpoint
CREATE TABLE "spec_item" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "spec_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "spec_item_kind_key_unique" UNIQUE("kind","key"),
	CONSTRAINT "spec_item_kind_valid" CHECK ("spec_item"."kind" in ('technique','finishing','material_hint')),
	CONSTRAINT "spec_item_key_format" CHECK ("spec_item"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "spec_item_i18n" (
	"spec_item_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "spec_item_i18n_spec_item_id_locale_pk" PRIMARY KEY("spec_item_id","locale"),
	CONSTRAINT "spec_item_i18n_label_nonblank" CHECK (nonblank("spec_item_i18n"."label"))
);
--> statement-breakpoint
CREATE TABLE "trait" (
	"key" text PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "trait_key_format" CHECK ("trait"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "trait_icon_format" CHECK ("trait"."icon" ~ '^[A-Za-z0-9]+$')
);
--> statement-breakpoint
CREATE TABLE "trait_i18n" (
	"trait_key" text NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	CONSTRAINT "trait_i18n_trait_key_locale_pk" PRIMARY KEY("trait_key","locale"),
	CONSTRAINT "trait_i18n_label_nonblank" CHECK (nonblank("trait_i18n"."label")),
	CONSTRAINT "trait_i18n_description_nonblank" CHECK ("trait_i18n"."description" is null or nonblank("trait_i18n"."description"))
);
--> statement-breakpoint
CREATE TABLE "unit" (
	"key" text PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "unit_key_format" CHECK ("unit"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "unit_i18n" (
	"unit_key" text NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "unit_i18n_unit_key_locale_pk" PRIMARY KEY("unit_key","locale"),
	CONSTRAINT "unit_i18n_label_nonblank" CHECK (nonblank("unit_i18n"."label"))
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"cover_media_id" bigint,
	"position" smallint NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"menu_version" integer DEFAULT 1 NOT NULL,
	"updated_by" text,
	"og_media_id" bigint,
	"og_media_kind" text DEFAULT 'image' NOT NULL,
	CONSTRAINT "category_id_format" CHECK ("category"."id" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "category_id_not_fast_print" CHECK ("category"."id" <> 'fast-print'),
	CONSTRAINT "category_icon_format" CHECK ("category"."icon" ~ '^[A-Za-z0-9]+$'),
	CONSTRAINT "category_position_nonneg" CHECK ("category"."position" >= 0),
	CONSTRAINT "category_og_media_kind_image" CHECK ("category"."og_media_kind" in ('image'))
);
--> statement-breakpoint
CREATE TABLE "category_i18n" (
	"category_id" text NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "category_i18n_category_id_locale_pk" PRIMARY KEY("category_id","locale"),
	CONSTRAINT "category_i18n_name_nonblank" CHECK (nonblank("category_i18n"."name")),
	CONSTRAINT "category_i18n_description_nonblank" CHECK ("category_i18n"."description" is null or nonblank("category_i18n"."description")),
	CONSTRAINT "category_i18n_seo_title_nonblank" CHECK ("category_i18n"."seo_title" is null or nonblank("category_i18n"."seo_title")),
	CONSTRAINT "category_i18n_seo_description_nonblank" CHECK ("category_i18n"."seo_description" is null or nonblank("category_i18n"."seo_description"))
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"category_id" text NOT NULL,
	"cover_media_id" bigint,
	"position" smallint NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"og_media_id" bigint,
	"og_media_kind" text DEFAULT 'image' NOT NULL,
	CONSTRAINT "product_uid_unique" UNIQUE("uid"),
	CONSTRAINT "product_position_nonneg" CHECK ("product"."position" >= 0),
	CONSTRAINT "product_status_valid" CHECK ("product"."status" in ('published','archived')),
	CONSTRAINT "product_og_media_kind_image" CHECK ("product"."og_media_kind" in ('image'))
);
--> statement-breakpoint
CREATE TABLE "product_i18n" (
	"product_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "product_i18n_product_id_locale_pk" PRIMARY KEY("product_id","locale"),
	CONSTRAINT "product_i18n_title_nonblank" CHECK (nonblank("product_i18n"."title")),
	CONSTRAINT "product_i18n_description_nonblank" CHECK ("product_i18n"."description" is null or nonblank("product_i18n"."description")),
	CONSTRAINT "product_i18n_seo_title_nonblank" CHECK ("product_i18n"."seo_title" is null or nonblank("product_i18n"."seo_title")),
	CONSTRAINT "product_i18n_seo_description_nonblank" CHECK ("product_i18n"."seo_description" is null or nonblank("product_i18n"."seo_description"))
);
--> statement-breakpoint
CREATE TABLE "product_slug" (
	"category_id" text NOT NULL,
	"slug" text NOT NULL,
	"product_id" bigint NOT NULL,
	"is_canonical" boolean DEFAULT false NOT NULL,
	CONSTRAINT "product_slug_category_id_slug_pk" PRIMARY KEY("category_id","slug"),
	CONSTRAINT "product_slug_slug_format" CHECK ("product_slug"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "option" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "option_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"product_id" bigint NOT NULL,
	"shape_id" bigint,
	"material_id" bigint NOT NULL,
	"position" smallint NOT NULL,
	"icon" text,
	"hide_foil" boolean DEFAULT false NOT NULL,
	"hide_double_sided" boolean DEFAULT false NOT NULL,
	"base_price" integer,
	"double_sided_price" integer,
	"foil_price" integer,
	"foil2_price" integer,
	"unit_key" text,
	"og_media_id" bigint,
	"og_media_kind" text DEFAULT 'image' NOT NULL,
	CONSTRAINT "option_uid_unique" UNIQUE("uid"),
	CONSTRAINT "option_id_product_id_unique" UNIQUE("id","product_id"),
	CONSTRAINT "option_position_nonneg" CHECK ("option"."position" >= 0),
	CONSTRAINT "option_icon_format" CHECK ("option"."icon" is null or "option"."icon" ~ '^[A-Za-z0-9]+$'),
	CONSTRAINT "option_base_price_nonneg" CHECK ("option"."base_price" >= 0),
	CONSTRAINT "option_double_sided_price_nonneg" CHECK ("option"."double_sided_price" >= 0),
	CONSTRAINT "option_foil_price_nonneg" CHECK ("option"."foil_price" >= 0),
	CONSTRAINT "option_foil2_price_nonneg" CHECK ("option"."foil2_price" >= 0),
	CONSTRAINT "option_og_media_kind_image" CHECK ("option"."og_media_kind" in ('image'))
);
--> statement-breakpoint
CREATE TABLE "option_bullet" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "option_bullet_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"option_id" bigint NOT NULL,
	"kind" text NOT NULL,
	"position" smallint NOT NULL,
	"trait_key" text,
	CONSTRAINT "option_bullet_option_kind_position_unique" UNIQUE("option_id","kind","position"),
	CONSTRAINT "option_bullet_kind_valid" CHECK ("option_bullet"."kind" in ('feature','best_for')),
	CONSTRAINT "option_bullet_position_nonneg" CHECK ("option_bullet"."position" >= 0),
	CONSTRAINT "option_bullet_trait_only_features" CHECK ("option_bullet"."kind" = 'feature' or "option_bullet"."trait_key" is null)
);
--> statement-breakpoint
CREATE TABLE "option_bullet_i18n" (
	"bullet_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "option_bullet_i18n_bullet_id_locale_pk" PRIMARY KEY("bullet_id","locale"),
	CONSTRAINT "option_bullet_i18n_text_nonblank" CHECK (nonblank("option_bullet_i18n"."text"))
);
--> statement-breakpoint
CREATE TABLE "option_i18n" (
	"option_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"name" text,
	"card_title" text,
	"tagline" text,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "option_i18n_option_id_locale_pk" PRIMARY KEY("option_id","locale"),
	CONSTRAINT "option_i18n_name_nonblank" CHECK ("option_i18n"."name" is null or nonblank("option_i18n"."name")),
	CONSTRAINT "option_i18n_card_title_nonblank" CHECK ("option_i18n"."card_title" is null or nonblank("option_i18n"."card_title")),
	CONSTRAINT "option_i18n_tagline_nonblank" CHECK ("option_i18n"."tagline" is null or nonblank("option_i18n"."tagline")),
	CONSTRAINT "option_i18n_seo_title_nonblank" CHECK ("option_i18n"."seo_title" is null or nonblank("option_i18n"."seo_title")),
	CONSTRAINT "option_i18n_seo_description_nonblank" CHECK ("option_i18n"."seo_description" is null or nonblank("option_i18n"."seo_description")),
	CONSTRAINT "option_i18n_not_empty" CHECK ("option_i18n"."name" is not null or "option_i18n"."card_title" is not null or "option_i18n"."tagline" is not null or "option_i18n"."seo_title" is not null or "option_i18n"."seo_description" is not null)
);
--> statement-breakpoint
CREATE TABLE "option_image" (
	"option_id" bigint NOT NULL,
	"variant" text NOT NULL,
	"position" smallint NOT NULL,
	"media_id" bigint NOT NULL,
	"media_kind" text DEFAULT 'image' NOT NULL,
	CONSTRAINT "option_image_option_id_variant_position_pk" PRIMARY KEY("option_id","variant","position"),
	CONSTRAINT "option_image_variant_valid" CHECK ("option_image"."variant" in ('default','pure')),
	CONSTRAINT "option_image_position_nonneg" CHECK ("option_image"."position" >= 0),
	CONSTRAINT "option_image_media_kind_image" CHECK ("option_image"."media_kind" in ('image'))
);
--> statement-breakpoint
CREATE TABLE "product_segment" (
	"product_id" bigint NOT NULL,
	"slug" text NOT NULL,
	"shape_id" bigint,
	"option_id" bigint,
	"is_canonical" boolean DEFAULT false NOT NULL,
	CONSTRAINT "product_segment_product_id_slug_pk" PRIMARY KEY("product_id","slug"),
	CONSTRAINT "product_segment_slug_format" CHECK ("product_segment"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "product_segment_one_target" CHECK (("product_segment"."shape_id" is not null) <> ("product_segment"."option_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "shape" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shape_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"product_id" bigint NOT NULL,
	"image_media_id" bigint,
	"position" smallint NOT NULL,
	"og_media_id" bigint,
	"og_media_kind" text DEFAULT 'image' NOT NULL,
	CONSTRAINT "shape_uid_unique" UNIQUE("uid"),
	CONSTRAINT "shape_id_product_id_unique" UNIQUE("id","product_id"),
	CONSTRAINT "shape_position_nonneg" CHECK ("shape"."position" >= 0),
	CONSTRAINT "shape_og_media_kind_image" CHECK ("shape"."og_media_kind" in ('image'))
);
--> statement-breakpoint
CREATE TABLE "shape_i18n" (
	"shape_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"badge" text,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "shape_i18n_shape_id_locale_pk" PRIMARY KEY("shape_id","locale"),
	CONSTRAINT "shape_i18n_name_nonblank" CHECK (nonblank("shape_i18n"."name")),
	CONSTRAINT "shape_i18n_description_nonblank" CHECK ("shape_i18n"."description" is null or nonblank("shape_i18n"."description")),
	CONSTRAINT "shape_i18n_badge_nonblank" CHECK ("shape_i18n"."badge" is null or nonblank("shape_i18n"."badge")),
	CONSTRAINT "shape_i18n_seo_title_nonblank" CHECK ("shape_i18n"."seo_title" is null or nonblank("shape_i18n"."seo_title")),
	CONSTRAINT "shape_i18n_seo_description_nonblank" CHECK ("shape_i18n"."seo_description" is null or nonblank("shape_i18n"."seo_description"))
);
--> statement-breakpoint
CREATE TABLE "product_spec" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_spec_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"shape_id" bigint,
	"spec_item_id" bigint NOT NULL,
	"position" smallint NOT NULL,
	CONSTRAINT "product_spec_scope_item_unique" UNIQUE NULLS NOT DISTINCT("product_id","shape_id","spec_item_id"),
	CONSTRAINT "product_spec_position_nonneg" CHECK ("product_spec"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "size_option" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "size_option_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"shape_id" bigint,
	"tier" text NOT NULL,
	"width_mm" integer,
	"height_mm" integer,
	"depth_mm" integer,
	"dims_text" text,
	CONSTRAINT "size_option_scope_tier_unique" UNIQUE NULLS NOT DISTINCT("product_id","shape_id","tier"),
	CONSTRAINT "size_option_tier_valid" CHECK ("size_option"."tier" in ('large','medium','small')),
	CONSTRAINT "size_option_width_positive" CHECK ("size_option"."width_mm" > 0),
	CONSTRAINT "size_option_height_positive" CHECK ("size_option"."height_mm" > 0),
	CONSTRAINT "size_option_depth_positive" CHECK ("size_option"."depth_mm" > 0),
	CONSTRAINT "size_option_dims_text_nonblank" CHECK ("size_option"."dims_text" is null or nonblank("size_option"."dims_text")),
	CONSTRAINT "size_option_numeric_xor_text" CHECK (("size_option"."width_mm" is not null and "size_option"."height_mm" is not null) <> ("size_option"."dims_text" is not null)),
	CONSTRAINT "size_option_depth_needs_dims" CHECK ("size_option"."depth_mm" is null or ("size_option"."width_mm" is not null and "size_option"."height_mm" is not null))
);
--> statement-breakpoint
CREATE TABLE "size_option_i18n" (
	"size_option_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"note" text NOT NULL,
	CONSTRAINT "size_option_i18n_size_option_id_locale_pk" PRIMARY KEY("size_option_id","locale"),
	CONSTRAINT "size_option_i18n_note_nonblank" CHECK (nonblank("size_option_i18n"."note"))
);
--> statement-breakpoint
CREATE TABLE "menu_group" (
	"product_id" bigint PRIMARY KEY NOT NULL,
	"menu_column" smallint NOT NULL,
	"position" smallint NOT NULL,
	"image_media_id" bigint,
	CONSTRAINT "menu_group_column_positive" CHECK ("menu_group"."menu_column" > 0),
	CONSTRAINT "menu_group_position_nonneg" CHECK ("menu_group"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "menu_group_i18n" (
	"product_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"label" text,
	"description" text,
	CONSTRAINT "menu_group_i18n_product_id_locale_pk" PRIMARY KEY("product_id","locale"),
	CONSTRAINT "menu_group_i18n_label_nonblank" CHECK ("menu_group_i18n"."label" is null or nonblank("menu_group_i18n"."label")),
	CONSTRAINT "menu_group_i18n_description_nonblank" CHECK ("menu_group_i18n"."description" is null or nonblank("menu_group_i18n"."description")),
	CONSTRAINT "menu_group_i18n_not_empty" CHECK ("menu_group_i18n"."label" is not null or "menu_group_i18n"."description" is not null)
);
--> statement-breakpoint
CREATE TABLE "menu_item" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "menu_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"product_id" bigint NOT NULL,
	"position" smallint NOT NULL,
	"shape_id" bigint,
	"option_id" bigint,
	"is_fast" boolean DEFAULT false NOT NULL,
	"image_media_id" bigint,
	CONSTRAINT "menu_item_position_nonneg" CHECK ("menu_item"."position" >= 0),
	CONSTRAINT "menu_item_one_target" CHECK (("menu_item"."shape_id" is not null) <> ("menu_item"."option_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "menu_item_i18n" (
	"menu_item_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "menu_item_i18n_menu_item_id_locale_pk" PRIMARY KEY("menu_item_id","locale"),
	CONSTRAINT "menu_item_i18n_label_nonblank" CHECK (nonblank("menu_item_i18n"."label"))
);
--> statement-breakpoint
CREATE TABLE "fast_print_item" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fast_print_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"image_media_id" bigint,
	"icon" text NOT NULL,
	"turnaround_hours" smallint,
	"from_price" integer,
	"unit_key" text,
	"position" smallint NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "fast_print_item_uid_unique" UNIQUE("uid"),
	CONSTRAINT "fast_print_item_key_unique" UNIQUE("key"),
	CONSTRAINT "fast_print_item_key_format" CHECK ("fast_print_item"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "fast_print_item_icon_format" CHECK ("fast_print_item"."icon" ~ '^[A-Za-z0-9]+$'),
	CONSTRAINT "fast_print_item_turnaround_positive" CHECK ("fast_print_item"."turnaround_hours" > 0),
	CONSTRAINT "fast_print_item_price_nonneg" CHECK ("fast_print_item"."from_price" >= 0),
	CONSTRAINT "fast_print_item_position_nonneg" CHECK ("fast_print_item"."position" >= 0),
	CONSTRAINT "fast_print_item_status_valid" CHECK ("fast_print_item"."status" in ('published','archived'))
);
--> statement-breakpoint
CREATE TABLE "fast_print_item_i18n" (
	"item_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"name" text NOT NULL,
	"tag" text,
	"description" text,
	CONSTRAINT "fast_print_item_i18n_item_id_locale_pk" PRIMARY KEY("item_id","locale"),
	CONSTRAINT "fast_print_item_i18n_name_nonblank" CHECK (nonblank("fast_print_item_i18n"."name")),
	CONSTRAINT "fast_print_item_i18n_tag_nonblank" CHECK ("fast_print_item_i18n"."tag" is null or nonblank("fast_print_item_i18n"."tag")),
	CONSTRAINT "fast_print_item_i18n_description_nonblank" CHECK ("fast_print_item_i18n"."description" is null or nonblank("fast_print_item_i18n"."description"))
);
--> statement-breakpoint
CREATE TABLE "showcase_item" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "showcase_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"media_id" bigint NOT NULL,
	"aspect" text DEFAULT 'square' NOT NULL,
	"position" smallint NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "showcase_item_uid_unique" UNIQUE("uid"),
	CONSTRAINT "showcase_item_key_unique" UNIQUE("key"),
	CONSTRAINT "showcase_item_key_format" CHECK ("showcase_item"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "showcase_item_aspect_valid" CHECK ("showcase_item"."aspect" in ('tall','square','wide')),
	CONSTRAINT "showcase_item_position_nonneg" CHECK ("showcase_item"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "showcase_item_i18n" (
	"item_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "showcase_item_i18n_item_id_locale_pk" PRIMARY KEY("item_id","locale"),
	CONSTRAINT "showcase_item_i18n_label_nonblank" CHECK (nonblank("showcase_item_i18n"."label"))
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "post_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"category_key" text NOT NULL,
	"published_on" date NOT NULL,
	"read_time_min" smallint,
	"cover_media_id" bigint,
	"content_format" text DEFAULT 'plain' NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"og_media_id" bigint,
	"og_media_kind" text DEFAULT 'image' NOT NULL,
	CONSTRAINT "post_uid_unique" UNIQUE("uid"),
	CONSTRAINT "post_read_time_positive" CHECK ("post"."read_time_min" > 0),
	CONSTRAINT "post_content_format_valid" CHECK ("post"."content_format" in ('plain','markdown')),
	CONSTRAINT "post_status_valid" CHECK ("post"."status" in ('published','archived')),
	CONSTRAINT "post_og_media_kind_image" CHECK ("post"."og_media_kind" in ('image'))
);
--> statement-breakpoint
CREATE TABLE "post_category" (
	"key" text PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "post_category_key_format" CHECK ("post_category"."key" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "post_category_i18n" (
	"category_key" text NOT NULL,
	"locale" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "post_category_i18n_category_key_locale_pk" PRIMARY KEY("category_key","locale"),
	CONSTRAINT "post_category_i18n_label_nonblank" CHECK (nonblank("post_category_i18n"."label"))
);
--> statement-breakpoint
CREATE TABLE "post_i18n" (
	"post_id" bigint NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"seo_title" text,
	"seo_description" text,
	CONSTRAINT "post_i18n_post_id_locale_pk" PRIMARY KEY("post_id","locale"),
	CONSTRAINT "post_i18n_title_nonblank" CHECK (nonblank("post_i18n"."title")),
	CONSTRAINT "post_i18n_excerpt_nonblank" CHECK ("post_i18n"."excerpt" is null or nonblank("post_i18n"."excerpt")),
	CONSTRAINT "post_i18n_content_nonblank" CHECK (nonblank("post_i18n"."content")),
	CONSTRAINT "post_i18n_seo_title_nonblank" CHECK ("post_i18n"."seo_title" is null or nonblank("post_i18n"."seo_title")),
	CONSTRAINT "post_i18n_seo_description_nonblank" CHECK ("post_i18n"."seo_description" is null or nonblank("post_i18n"."seo_description"))
);
--> statement-breakpoint
CREATE TABLE "post_slug" (
	"slug" text PRIMARY KEY NOT NULL,
	"post_id" bigint NOT NULL,
	"is_canonical" boolean DEFAULT false NOT NULL,
	CONSTRAINT "post_slug_slug_format" CHECK ("post_slug"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "site_message" (
	"locale" text NOT NULL,
	"namespace" text NOT NULL,
	"data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "site_message_locale_namespace_pk" PRIMARY KEY("locale","namespace"),
	CONSTRAINT "site_message_namespace_format" CHECK ("site_message"."namespace" ~ '^[A-Za-z][A-Za-z0-9]*$'),
	CONSTRAINT "site_message_data_object" CHECK (jsonb_typeof("site_message"."data") = 'object')
);
--> statement-breakpoint
CREATE TABLE "content_draft" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_draft_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"entity_type" text NOT NULL,
	"entity_uid" uuid,
	"entity_key" text,
	"base_version" integer,
	"draft_version" integer DEFAULT 1 NOT NULL,
	"snapshot_schema" smallint DEFAULT 2 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"note" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_draft_type_uid_unique" UNIQUE("entity_type","entity_uid"),
	CONSTRAINT "content_draft_type_key_unique" UNIQUE("entity_type","entity_key"),
	CONSTRAINT "content_draft_entity_type_valid" CHECK ("content_draft"."entity_type" in ('product','post','category','material','trait','unit','spec_item','fast_print_item','showcase_item','post_category','site_message','menu')),
	CONSTRAINT "content_draft_base_version_positive" CHECK ("content_draft"."base_version" >= 1),
	CONSTRAINT "content_draft_draft_version_positive" CHECK ("content_draft"."draft_version" >= 1),
	CONSTRAINT "content_draft_snapshot_object" CHECK (jsonb_typeof("content_draft"."snapshot") = 'object'),
	CONSTRAINT "content_draft_uid_xor_key" CHECK (("content_draft"."entity_uid" is not null) <> ("content_draft"."entity_key" is not null)),
	CONSTRAINT "content_draft_snapshot_uid" CHECK ("content_draft"."entity_uid" is null or "content_draft"."snapshot"->>'uid' = "content_draft"."entity_uid"::text),
	CONSTRAINT "content_draft_snapshot_key" CHECK ("content_draft"."entity_key" is null or "content_draft"."snapshot"->>'key' = "content_draft"."entity_key")
);
--> statement-breakpoint
CREATE TABLE "content_revision" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_revision_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"entity_type" text NOT NULL,
	"entity_uid" uuid,
	"entity_key" text,
	"version" integer NOT NULL,
	"action" text DEFAULT 'update' NOT NULL,
	"snapshot_schema" smallint DEFAULT 2 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"comment" text,
	"author" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_revision_type_uid_version_unique" UNIQUE("entity_type","entity_uid","version"),
	CONSTRAINT "content_revision_type_key_version_unique" UNIQUE("entity_type","entity_key","version"),
	CONSTRAINT "content_revision_action_valid" CHECK ("content_revision"."action" in ('import','create','update','archive','restore','delete')),
	CONSTRAINT "content_revision_uid_xor_key" CHECK (("content_revision"."entity_uid" is not null) <> ("content_revision"."entity_key" is not null)),
	CONSTRAINT "content_revision_snapshot_uid" CHECK ("content_revision"."entity_uid" is null or "content_revision"."snapshot"->>'uid' = "content_revision"."entity_uid"::text),
	CONSTRAINT "content_revision_snapshot_key" CHECK ("content_revision"."entity_key" is null or "content_revision"."snapshot"->>'key' = "content_revision"."entity_key")
);
--> statement-breakpoint
CREATE TABLE "draft_reference" (
	"draft_id" bigint NOT NULL,
	"ref_type" text NOT NULL,
	"ref_key" text NOT NULL,
	CONSTRAINT "draft_reference_draft_id_ref_type_ref_key_pk" PRIMARY KEY("draft_id","ref_type","ref_key"),
	CONSTRAINT "draft_reference_ref_type_valid" CHECK ("draft_reference"."ref_type" in ('material','trait','unit','spec_item','media'))
);
--> statement-breakpoint
CREATE TABLE "legacy_import" (
	"entity_type" text NOT NULL,
	"entity_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy_import_entity_type_entity_key_pk" PRIMARY KEY("entity_type","entity_key")
);
--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_i18n" ADD CONSTRAINT "media_i18n_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_i18n" ADD CONSTRAINT "media_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material" ADD CONSTRAINT "material_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_i18n" ADD CONSTRAINT "material_i18n_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material_i18n" ADD CONSTRAINT "material_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_item" ADD CONSTRAINT "spec_item_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_item_i18n" ADD CONSTRAINT "spec_item_i18n_spec_item_id_spec_item_id_fk" FOREIGN KEY ("spec_item_id") REFERENCES "public"."spec_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spec_item_i18n" ADD CONSTRAINT "spec_item_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trait" ADD CONSTRAINT "trait_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trait_i18n" ADD CONSTRAINT "trait_i18n_trait_key_trait_key_fk" FOREIGN KEY ("trait_key") REFERENCES "public"."trait"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trait_i18n" ADD CONSTRAINT "trait_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit" ADD CONSTRAINT "unit_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_i18n" ADD CONSTRAINT "unit_i18n_unit_key_unit_key_fk" FOREIGN KEY ("unit_key") REFERENCES "public"."unit"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_i18n" ADD CONSTRAINT "unit_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_og_media_fk" FOREIGN KEY ("og_media_id","og_media_kind") REFERENCES "public"."media"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_i18n" ADD CONSTRAINT "category_i18n_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_i18n" ADD CONSTRAINT "category_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_og_media_fk" FOREIGN KEY ("og_media_id","og_media_kind") REFERENCES "public"."media"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_i18n" ADD CONSTRAINT "product_i18n_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_i18n" ADD CONSTRAINT "product_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_slug" ADD CONSTRAINT "product_slug_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_slug" ADD CONSTRAINT "product_slug_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_unit_key_unit_key_fk" FOREIGN KEY ("unit_key") REFERENCES "public"."unit"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_shape_product_fk" FOREIGN KEY ("shape_id","product_id") REFERENCES "public"."shape"("id","product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option" ADD CONSTRAINT "option_og_media_fk" FOREIGN KEY ("og_media_id","og_media_kind") REFERENCES "public"."media"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_bullet" ADD CONSTRAINT "option_bullet_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_bullet" ADD CONSTRAINT "option_bullet_trait_key_trait_key_fk" FOREIGN KEY ("trait_key") REFERENCES "public"."trait"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_bullet_i18n" ADD CONSTRAINT "option_bullet_i18n_bullet_id_option_bullet_id_fk" FOREIGN KEY ("bullet_id") REFERENCES "public"."option_bullet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_bullet_i18n" ADD CONSTRAINT "option_bullet_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_i18n" ADD CONSTRAINT "option_i18n_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_i18n" ADD CONSTRAINT "option_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_image" ADD CONSTRAINT "option_image_option_id_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_image" ADD CONSTRAINT "option_image_media_fk" FOREIGN KEY ("media_id","media_kind") REFERENCES "public"."media"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_segment" ADD CONSTRAINT "product_segment_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_segment" ADD CONSTRAINT "product_segment_shape_fk" FOREIGN KEY ("shape_id","product_id") REFERENCES "public"."shape"("id","product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_segment" ADD CONSTRAINT "product_segment_option_fk" FOREIGN KEY ("option_id","product_id") REFERENCES "public"."option"("id","product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shape" ADD CONSTRAINT "shape_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shape" ADD CONSTRAINT "shape_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shape" ADD CONSTRAINT "shape_og_media_fk" FOREIGN KEY ("og_media_id","og_media_kind") REFERENCES "public"."media"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shape_i18n" ADD CONSTRAINT "shape_i18n_shape_id_shape_id_fk" FOREIGN KEY ("shape_id") REFERENCES "public"."shape"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shape_i18n" ADD CONSTRAINT "shape_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_spec" ADD CONSTRAINT "product_spec_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_spec" ADD CONSTRAINT "product_spec_spec_item_id_spec_item_id_fk" FOREIGN KEY ("spec_item_id") REFERENCES "public"."spec_item"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_spec" ADD CONSTRAINT "product_spec_shape_fk" FOREIGN KEY ("shape_id","product_id") REFERENCES "public"."shape"("id","product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "size_option" ADD CONSTRAINT "size_option_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "size_option" ADD CONSTRAINT "size_option_shape_fk" FOREIGN KEY ("shape_id","product_id") REFERENCES "public"."shape"("id","product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "size_option_i18n" ADD CONSTRAINT "size_option_i18n_size_option_id_size_option_id_fk" FOREIGN KEY ("size_option_id") REFERENCES "public"."size_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "size_option_i18n" ADD CONSTRAINT "size_option_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_group" ADD CONSTRAINT "menu_group_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_group" ADD CONSTRAINT "menu_group_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_group_i18n" ADD CONSTRAINT "menu_group_i18n_product_id_menu_group_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_group"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_group_i18n" ADD CONSTRAINT "menu_group_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_product_id_menu_group_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."menu_group"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_i18n" ADD CONSTRAINT "menu_item_i18n_menu_item_id_menu_item_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_i18n" ADD CONSTRAINT "menu_item_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fast_print_item" ADD CONSTRAINT "fast_print_item_image_media_id_media_id_fk" FOREIGN KEY ("image_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fast_print_item" ADD CONSTRAINT "fast_print_item_unit_key_unit_key_fk" FOREIGN KEY ("unit_key") REFERENCES "public"."unit"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fast_print_item" ADD CONSTRAINT "fast_print_item_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fast_print_item_i18n" ADD CONSTRAINT "fast_print_item_i18n_item_id_fast_print_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."fast_print_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fast_print_item_i18n" ADD CONSTRAINT "fast_print_item_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showcase_item" ADD CONSTRAINT "showcase_item_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showcase_item" ADD CONSTRAINT "showcase_item_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showcase_item_i18n" ADD CONSTRAINT "showcase_item_i18n_item_id_showcase_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."showcase_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showcase_item_i18n" ADD CONSTRAINT "showcase_item_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_category_key_post_category_key_fk" FOREIGN KEY ("category_key") REFERENCES "public"."post_category"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_og_media_fk" FOREIGN KEY ("og_media_id","og_media_kind") REFERENCES "public"."media"("id","kind") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category" ADD CONSTRAINT "post_category_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category_i18n" ADD CONSTRAINT "post_category_i18n_category_key_post_category_key_fk" FOREIGN KEY ("category_key") REFERENCES "public"."post_category"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_category_i18n" ADD CONSTRAINT "post_category_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_i18n" ADD CONSTRAINT "post_i18n_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_i18n" ADD CONSTRAINT "post_i18n_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_slug" ADD CONSTRAINT "post_slug_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_message" ADD CONSTRAINT "site_message_locale_locale_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locale"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_message" ADD CONSTRAINT "site_message_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_draft" ADD CONSTRAINT "content_draft_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_draft" ADD CONSTRAINT "content_draft_updated_by_app_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revision" ADD CONSTRAINT "content_revision_author_app_user_id_fk" FOREIGN KEY ("author") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_reference" ADD CONSTRAINT "draft_reference_draft_id_content_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."content_draft"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "locale_single_default" ON "locale" USING btree ((true)) WHERE "locale"."is_default";--> statement-breakpoint
CREATE INDEX "category_cover_media_idx" ON "category" USING btree ("cover_media_id");--> statement-breakpoint
CREATE INDEX "category_og_media_idx" ON "category" USING btree ("og_media_id");--> statement-breakpoint
CREATE INDEX "product_category_position_idx" ON "product" USING btree ("category_id","position");--> statement-breakpoint
CREATE INDEX "product_cover_media_idx" ON "product" USING btree ("cover_media_id");--> statement-breakpoint
CREATE INDEX "product_og_media_idx" ON "product" USING btree ("og_media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_slug_one_canonical" ON "product_slug" USING btree ("product_id") WHERE "product_slug"."is_canonical";--> statement-breakpoint
CREATE INDEX "product_slug_product_idx" ON "product_slug" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "option_product_shape_idx" ON "option" USING btree ("product_id","shape_id");--> statement-breakpoint
CREATE INDEX "option_material_idx" ON "option" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "option_unit_idx" ON "option" USING btree ("unit_key");--> statement-breakpoint
CREATE INDEX "option_og_media_idx" ON "option" USING btree ("og_media_id");--> statement-breakpoint
CREATE INDEX "option_bullet_option_idx" ON "option_bullet" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "option_bullet_trait_idx" ON "option_bullet" USING btree ("trait_key");--> statement-breakpoint
CREATE INDEX "option_image_media_idx" ON "option_image" USING btree ("media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_segment_one_canonical_shape" ON "product_segment" USING btree ("shape_id") WHERE "product_segment"."is_canonical" and "product_segment"."shape_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "product_segment_one_canonical_option" ON "product_segment" USING btree ("option_id") WHERE "product_segment"."is_canonical" and "product_segment"."option_id" is not null;--> statement-breakpoint
CREATE INDEX "product_segment_shape_idx" ON "product_segment" USING btree ("shape_id");--> statement-breakpoint
CREATE INDEX "product_segment_option_idx" ON "product_segment" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "shape_product_position_idx" ON "shape" USING btree ("product_id","position");--> statement-breakpoint
CREATE INDEX "shape_image_media_idx" ON "shape" USING btree ("image_media_id");--> statement-breakpoint
CREATE INDEX "shape_og_media_idx" ON "shape" USING btree ("og_media_id");--> statement-breakpoint
CREATE INDEX "product_spec_product_shape_idx" ON "product_spec" USING btree ("product_id","shape_id");--> statement-breakpoint
CREATE INDEX "product_spec_item_idx" ON "product_spec" USING btree ("spec_item_id");--> statement-breakpoint
CREATE INDEX "size_option_product_shape_idx" ON "size_option" USING btree ("product_id","shape_id");--> statement-breakpoint
CREATE INDEX "menu_group_image_media_idx" ON "menu_group" USING btree ("image_media_id");--> statement-breakpoint
CREATE INDEX "menu_item_product_position_idx" ON "menu_item" USING btree ("product_id","position");--> statement-breakpoint
CREATE INDEX "menu_item_shape_idx" ON "menu_item" USING btree ("shape_id");--> statement-breakpoint
CREATE INDEX "menu_item_option_idx" ON "menu_item" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "menu_item_image_media_idx" ON "menu_item" USING btree ("image_media_id");--> statement-breakpoint
CREATE INDEX "fast_print_item_image_media_idx" ON "fast_print_item" USING btree ("image_media_id");--> statement-breakpoint
CREATE INDEX "fast_print_item_unit_idx" ON "fast_print_item" USING btree ("unit_key");--> statement-breakpoint
CREATE INDEX "showcase_item_media_idx" ON "showcase_item" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "post_published_on_idx" ON "post" USING btree ("published_on" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "post_category_idx" ON "post" USING btree ("category_key");--> statement-breakpoint
CREATE INDEX "post_cover_media_idx" ON "post" USING btree ("cover_media_id");--> statement-breakpoint
CREATE INDEX "post_og_media_idx" ON "post" USING btree ("og_media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "post_slug_one_canonical" ON "post_slug" USING btree ("post_id") WHERE "post_slug"."is_canonical";--> statement-breakpoint
CREATE INDEX "post_slug_post_idx" ON "post_slug" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "content_draft_updated_at_idx" ON "content_draft" USING btree ("updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "content_revision_uid_idx" ON "content_revision" USING btree ("entity_type","entity_uid","version" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "content_revision_key_idx" ON "content_revision" USING btree ("entity_type","entity_key","version" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "draft_reference_ref_idx" ON "draft_reference" USING btree ("ref_type","ref_key");