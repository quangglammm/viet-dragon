-- Integrity rules for the content tables that plain constraints (and Drizzle) cannot express. Reference design:
-- docs/data-model.md §3-§4; every rule below has a test in lib/db/content-schema.int.test.ts, including the
-- attempts to bypass it.
--
--   1. immutable keys / uids       (forbid_key_change)
--   2. frozen namespace owners     (so the commit-time checks below cannot be sidestepped by an UPDATE)
--   3. TRUNCATE guards             (TRUNCATE skips row triggers and would bypass everything)
--   4. commit-time invariants      (canonical slug / segment / post slug; default-language translation)
--   5. menu_item -> shape/option   foreign keys, DEFERRABLE INITIALLY DEFERRED
--   6. the `locale` reference rows
--
-- The application role (vietdragon_app) never gets TRUNCATE or DDL (deploy/db-init/01-app-role.sh). A migration
-- that must TRUNCATE a guarded table disables its guard trigger explicitly.

-- ───────────── 1. immutable identity ─────────────
CREATE FUNCTION forbid_key_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE c text; o text; n text;
BEGIN
  FOREACH c IN ARRAY TG_ARGV LOOP
    EXECUTE format('select ($1).%I::text, ($2).%I::text', c, c) INTO o, n USING OLD, NEW;
    IF o IS DISTINCT FROM n THEN
      RAISE EXCEPTION '%.% is immutable (was %, now %)', TG_TABLE_NAME, c, o, n USING ERRCODE = '23514';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER media_key_immutable           BEFORE UPDATE ON media           FOR EACH ROW EXECUTE FUNCTION forbid_key_change('storage_key');
--> statement-breakpoint
CREATE TRIGGER unit_key_immutable            BEFORE UPDATE ON unit            FOR EACH ROW EXECUTE FUNCTION forbid_key_change('key');
--> statement-breakpoint
CREATE TRIGGER trait_key_immutable           BEFORE UPDATE ON trait           FOR EACH ROW EXECUTE FUNCTION forbid_key_change('key');
--> statement-breakpoint
CREATE TRIGGER material_key_immutable        BEFORE UPDATE ON material        FOR EACH ROW EXECUTE FUNCTION forbid_key_change('slug');
--> statement-breakpoint
CREATE TRIGGER spec_item_key_immutable       BEFORE UPDATE ON spec_item       FOR EACH ROW EXECUTE FUNCTION forbid_key_change('kind', 'key');
--> statement-breakpoint
CREATE TRIGGER category_key_immutable        BEFORE UPDATE ON category        FOR EACH ROW EXECUTE FUNCTION forbid_key_change('id');
--> statement-breakpoint
CREATE TRIGGER post_category_key_immutable   BEFORE UPDATE ON post_category   FOR EACH ROW EXECUTE FUNCTION forbid_key_change('key');
--> statement-breakpoint
CREATE TRIGGER product_uid_immutable         BEFORE UPDATE ON product         FOR EACH ROW EXECUTE FUNCTION forbid_key_change('uid');
--> statement-breakpoint
CREATE TRIGGER shape_uid_immutable           BEFORE UPDATE ON shape           FOR EACH ROW EXECUTE FUNCTION forbid_key_change('uid');
--> statement-breakpoint
CREATE TRIGGER option_uid_immutable          BEFORE UPDATE ON option          FOR EACH ROW EXECUTE FUNCTION forbid_key_change('uid');
--> statement-breakpoint
CREATE TRIGGER post_uid_immutable            BEFORE UPDATE ON post            FOR EACH ROW EXECUTE FUNCTION forbid_key_change('uid');
--> statement-breakpoint
-- Not in the reference DDL: Fast Print and showcase items are uid entities too (their drafts and revisions are filed
-- under the uid), so the uid is frozen like the others.
CREATE TRIGGER fast_print_item_uid_immutable BEFORE UPDATE ON fast_print_item FOR EACH ROW EXECUTE FUNCTION forbid_key_change('uid');
--> statement-breakpoint
CREATE TRIGGER showcase_item_uid_immutable   BEFORE UPDATE ON showcase_item   FOR EACH ROW EXECUTE FUNCTION forbid_key_change('uid');
--> statement-breakpoint

-- ───────────── 2. frozen namespace owners ─────────────
CREATE TRIGGER product_slug_owner_frozen     BEFORE UPDATE ON product_slug    FOR EACH ROW EXECUTE FUNCTION forbid_key_change('product_id');
--> statement-breakpoint
CREATE TRIGGER product_segment_target_frozen BEFORE UPDATE ON product_segment FOR EACH ROW EXECUTE FUNCTION forbid_key_change('product_id', 'shape_id', 'option_id');
--> statement-breakpoint
CREATE TRIGGER post_slug_owner_frozen        BEFORE UPDATE ON post_slug       FOR EACH ROW EXECUTE FUNCTION forbid_key_change('post_id');
--> statement-breakpoint

-- ───────────── 3. TRUNCATE guards ─────────────
-- (audit_log has its own audit_log_immutable() in 0001.)
CREATE FUNCTION forbid_truncate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'TRUNCATE of % is not allowed (it would bypass its integrity triggers); disable the trigger explicitly in a migration', TG_TABLE_NAME USING ERRCODE = '42501';
END $$;
--> statement-breakpoint
CREATE TRIGGER product_slug_no_truncate     BEFORE TRUNCATE ON product_slug     FOR EACH STATEMENT EXECUTE FUNCTION forbid_truncate();
--> statement-breakpoint
CREATE TRIGGER product_segment_no_truncate  BEFORE TRUNCATE ON product_segment  FOR EACH STATEMENT EXECUTE FUNCTION forbid_truncate();
--> statement-breakpoint
CREATE TRIGGER post_slug_no_truncate        BEFORE TRUNCATE ON post_slug        FOR EACH STATEMENT EXECUTE FUNCTION forbid_truncate();
--> statement-breakpoint
CREATE TRIGGER content_revision_no_truncate BEFORE TRUNCATE ON content_revision FOR EACH STATEMENT EXECUTE FUNCTION forbid_truncate();
--> statement-breakpoint
CREATE TRIGGER legacy_import_no_truncate    BEFORE TRUNCATE ON legacy_import    FOR EACH STATEMENT EXECUTE FUNCTION forbid_truncate();
--> statement-breakpoint

-- ───────────── 4. invariants checked at COMMIT ─────────────
-- Every product has exactly one canonical slug, in its own category.
CREATE FUNCTION assert_product_slug() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid bigint; cat text;
BEGIN
  IF TG_TABLE_NAME = 'product' THEN
    pid := NEW.id; cat := NEW.category_id;
  ELSE
    pid := CASE WHEN TG_OP = 'DELETE' THEN OLD.product_id ELSE NEW.product_id END;
    SELECT category_id INTO cat FROM product WHERE id = pid;
    IF NOT FOUND THEN RETURN NULL; END IF;                           -- the product itself is gone (cascade)
  END IF;
  IF NOT EXISTS (SELECT 1 FROM product_slug WHERE product_id = pid AND is_canonical AND category_id = cat) THEN
    RAISE EXCEPTION 'product % has no canonical slug in category %', pid, cat USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER product_has_slug       AFTER INSERT OR UPDATE OF category_id ON product      DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_product_slug();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER product_slug_canonical AFTER UPDATE OR DELETE                ON product_slug DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_product_slug();
--> statement-breakpoint

-- Every shape and option has exactly one canonical segment.
CREATE FUNCTION assert_segment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE sid bigint; oid_ bigint;
BEGIN
  IF TG_TABLE_NAME = 'shape' THEN sid := NEW.id;
  ELSIF TG_TABLE_NAME = 'option' THEN oid_ := NEW.id;
  ELSE
    sid  := CASE WHEN TG_OP = 'DELETE' THEN OLD.shape_id  ELSE NEW.shape_id  END;
    oid_ := CASE WHEN TG_OP = 'DELETE' THEN OLD.option_id ELSE NEW.option_id END;
  END IF;
  IF sid IS NOT NULL AND EXISTS (SELECT 1 FROM shape WHERE id = sid)
     AND NOT EXISTS (SELECT 1 FROM product_segment WHERE shape_id = sid AND is_canonical) THEN
    RAISE EXCEPTION 'shape % has no canonical slug', sid USING ERRCODE = '23514';
  END IF;
  IF oid_ IS NOT NULL AND EXISTS (SELECT 1 FROM option WHERE id = oid_)
     AND NOT EXISTS (SELECT 1 FROM product_segment WHERE option_id = oid_ AND is_canonical) THEN
    RAISE EXCEPTION 'option % has no canonical slug', oid_ USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER shape_has_segment   AFTER INSERT          ON shape           DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_segment();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER option_has_segment  AFTER INSERT          ON option          DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_segment();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER segment_canonical   AFTER UPDATE OR DELETE ON product_segment DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_segment();
--> statement-breakpoint

-- Every post has exactly one canonical slug.
CREATE FUNCTION assert_post_slug() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid bigint;
BEGIN
  IF TG_TABLE_NAME = 'post' THEN
    pid := NEW.id;
  ELSE
    pid := CASE WHEN TG_OP = 'DELETE' THEN OLD.post_id ELSE NEW.post_id END;
    IF NOT EXISTS (SELECT 1 FROM post WHERE id = pid) THEN RETURN NULL; END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM post_slug WHERE post_id = pid AND is_canonical) THEN
    RAISE EXCEPTION 'post % has no canonical slug', pid USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER post_has_slug       AFTER INSERT          ON post      DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_post_slug();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER post_slug_canonical AFTER UPDATE OR DELETE ON post_slug DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_post_slug();
--> statement-breakpoint

-- The default language is required for every translated entity. TG_ARGV: owner table, owner key column,
-- i18n table, i18n owner column.
CREATE FUNCTION assert_default_i18n() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE dl text; owner_val text; present boolean;
BEGIN
  SELECT code INTO dl FROM locale WHERE is_default;
  IF dl IS NULL THEN RETURN NULL; END IF;
  IF TG_TABLE_NAME = TG_ARGV[0] THEN
    EXECUTE format('select ($1).%I::text', TG_ARGV[1]) INTO owner_val USING NEW;
  ELSIF TG_OP = 'DELETE' THEN
    EXECUTE format('select ($1).%I::text', TG_ARGV[3]) INTO owner_val USING OLD;
  ELSE
    EXECUTE format('select ($1).%I::text', TG_ARGV[3]) INTO owner_val USING NEW;
  END IF;
  EXECUTE format('select exists (select 1 from %I where %I::text = $1)', TG_ARGV[0], TG_ARGV[1]) INTO present USING owner_val;
  IF NOT present THEN RETURN NULL; END IF;                           -- the owner is gone (cascade)
  EXECUTE format('select exists (select 1 from %I where %I::text = $1 and locale = $2)', TG_ARGV[2], TG_ARGV[3]) INTO present USING owner_val, dl;
  IF NOT present THEN
    RAISE EXCEPTION '% % has no "%" (default language) translation', TG_ARGV[0], owner_val, dl USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT * FROM (VALUES
      ('product', 'id', 'product_i18n', 'product_id'), ('shape', 'id', 'shape_i18n', 'shape_id'), ('post', 'id', 'post_i18n', 'post_id'),
      ('category', 'id', 'category_i18n', 'category_id'), ('material', 'id', 'material_i18n', 'material_id'), ('trait', 'key', 'trait_i18n', 'trait_key'),
      ('unit', 'key', 'unit_i18n', 'unit_key'), ('spec_item', 'id', 'spec_item_i18n', 'spec_item_id'),
      ('fast_print_item', 'id', 'fast_print_item_i18n', 'item_id'), ('showcase_item', 'id', 'showcase_item_i18n', 'item_id'),
      ('post_category', 'key', 'post_category_i18n', 'category_key')) AS v(o, opk, i, ifk)
  LOOP
    EXECUTE format('create constraint trigger %I after insert on %I deferrable initially deferred for each row execute function assert_default_i18n(%L,%L,%L,%L)',
                   t.o || '_has_default_i18n', t.o, t.o, t.opk, t.i, t.ifk);
    EXECUTE format('create constraint trigger %I after update or delete on %I deferrable initially deferred for each row execute function assert_default_i18n(%L,%L,%L,%L)',
                   t.i || '_keeps_default', t.i, t.o, t.opk, t.i, t.ifk);
  END LOOP;
END $$;
--> statement-breakpoint

-- ───────────── 5. menu_item -> shape / option, deferred to COMMIT ─────────────
-- An immediate check would fire on the cascaded shape delete before the menu rows are cascaded away, which would
-- block deleting a whole product; deferred, a shape still in a menu cannot be deleted on its own but a product can.
ALTER TABLE menu_item ADD CONSTRAINT menu_item_shape_fk  FOREIGN KEY (shape_id,  product_id) REFERENCES shape(id,  product_id) DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint
ALTER TABLE menu_item ADD CONSTRAINT menu_item_option_fk FOREIGN KEY (option_id, product_id) REFERENCES option(id, product_id) DEFERRABLE INITIALLY DEFERRED;
--> statement-breakpoint

-- ───────────── 6. reference rows ─────────────
-- The language list also lives in i18n/routing.ts (adding a language = a row here + messages/<code>.json + the route).
INSERT INTO locale (code, is_default, position) VALUES ('vi', true, 0), ('en', false, 1), ('zh', false, 2), ('ja', false, 3), ('ko', false, 4);
