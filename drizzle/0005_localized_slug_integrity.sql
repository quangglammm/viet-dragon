-- Commit-time rules for per-language slugs (the tables are in 0004_localized_slugs.sql).
--   * every product / shape / option / post / category has exactly one canonical slug in EVERY language of the `locale` table
--     (a missing language is refused, so a URL always exists in every language; the seed clones English into zh/ja/ko);
--   * adding a language is refused until every entity has a canonical slug in it, in the same transaction;
--   * a slug row's language is frozen like its owner, so a canonical slug cannot be moved to another language;
--   * the new category_slug table gets the same guards as the other namespace tables.
-- The functions keep their names (CREATE OR REPLACE), so the constraint triggers from 0003 pick up the new bodies.

-- A product has a canonical slug in its own category in every language.
CREATE OR REPLACE FUNCTION assert_product_slug() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid bigint; cat text; missing text;
BEGIN
  IF TG_TABLE_NAME = 'product' THEN
    pid := NEW.id; cat := NEW.category_id;
  ELSE
    pid := CASE WHEN TG_OP = 'DELETE' THEN OLD.product_id ELSE NEW.product_id END;
    SELECT category_id INTO cat FROM product WHERE id = pid;
    IF NOT FOUND THEN RETURN NULL; END IF;                           -- the product itself is gone (cascade)
  END IF;
  SELECT l.code INTO missing FROM locale l
   WHERE NOT EXISTS (SELECT 1 FROM product_slug s WHERE s.product_id = pid AND s.is_canonical AND s.category_id = cat AND s.locale = l.code)
   ORDER BY l.position LIMIT 1;
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'product % has no canonical slug in category % for language %', pid, cat, missing USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint

-- Every shape and option has a canonical segment in every language.
CREATE OR REPLACE FUNCTION assert_segment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE sid bigint; oid_ bigint; missing text;
BEGIN
  IF TG_TABLE_NAME = 'shape' THEN sid := NEW.id;
  ELSIF TG_TABLE_NAME = 'option' THEN oid_ := NEW.id;
  ELSE
    sid  := CASE WHEN TG_OP = 'DELETE' THEN OLD.shape_id  ELSE NEW.shape_id  END;
    oid_ := CASE WHEN TG_OP = 'DELETE' THEN OLD.option_id ELSE NEW.option_id END;
  END IF;
  IF sid IS NOT NULL AND EXISTS (SELECT 1 FROM shape WHERE id = sid) THEN
    SELECT l.code INTO missing FROM locale l
     WHERE NOT EXISTS (SELECT 1 FROM product_segment s WHERE s.shape_id = sid AND s.is_canonical AND s.locale = l.code)
     ORDER BY l.position LIMIT 1;
    IF missing IS NOT NULL THEN RAISE EXCEPTION 'shape % has no canonical slug for language %', sid, missing USING ERRCODE = '23514'; END IF;
  END IF;
  IF oid_ IS NOT NULL AND EXISTS (SELECT 1 FROM option WHERE id = oid_) THEN
    SELECT l.code INTO missing FROM locale l
     WHERE NOT EXISTS (SELECT 1 FROM product_segment s WHERE s.option_id = oid_ AND s.is_canonical AND s.locale = l.code)
     ORDER BY l.position LIMIT 1;
    IF missing IS NOT NULL THEN RAISE EXCEPTION 'option % has no canonical slug for language %', oid_, missing USING ERRCODE = '23514'; END IF;
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint

-- Every post has a canonical slug in every language.
CREATE OR REPLACE FUNCTION assert_post_slug() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid bigint; missing text;
BEGIN
  IF TG_TABLE_NAME = 'post' THEN
    pid := NEW.id;
  ELSE
    pid := CASE WHEN TG_OP = 'DELETE' THEN OLD.post_id ELSE NEW.post_id END;
    IF NOT EXISTS (SELECT 1 FROM post WHERE id = pid) THEN RETURN NULL; END IF;
  END IF;
  SELECT l.code INTO missing FROM locale l
   WHERE NOT EXISTS (SELECT 1 FROM post_slug s WHERE s.post_id = pid AND s.is_canonical AND s.locale = l.code)
   ORDER BY l.position LIMIT 1;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'post % has no canonical slug for language %', pid, missing USING ERRCODE = '23514'; END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint

-- Every category has a canonical slug in every language.
CREATE FUNCTION assert_category_slug() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE cid text; missing text;
BEGIN
  IF TG_TABLE_NAME = 'category' THEN
    cid := NEW.id;
  ELSE
    cid := CASE WHEN TG_OP = 'DELETE' THEN OLD.category_id ELSE NEW.category_id END;
    IF NOT EXISTS (SELECT 1 FROM category WHERE id = cid) THEN RETURN NULL; END IF;
  END IF;
  SELECT l.code INTO missing FROM locale l
   WHERE NOT EXISTS (SELECT 1 FROM category_slug s WHERE s.category_id = cid AND s.is_canonical AND s.locale = l.code)
   ORDER BY l.position LIMIT 1;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'category % has no canonical slug for language %', cid, missing USING ERRCODE = '23514'; END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER category_has_slug       AFTER INSERT          ON category      DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_category_slug();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER category_slug_canonical AFTER UPDATE OR DELETE ON category_slug DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_category_slug();
--> statement-breakpoint

-- A new language is refused until everything that has a URL also has one in it.
CREATE FUNCTION assert_locale_has_slugs() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE what text;
BEGIN
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM category c WHERE NOT EXISTS (SELECT 1 FROM category_slug s WHERE s.category_id = c.id AND s.is_canonical AND s.locale = NEW.code)) THEN 'categories'
    WHEN EXISTS (SELECT 1 FROM product p WHERE NOT EXISTS (SELECT 1 FROM product_slug s WHERE s.product_id = p.id AND s.is_canonical AND s.locale = NEW.code)) THEN 'products'
    WHEN EXISTS (SELECT 1 FROM shape x WHERE NOT EXISTS (SELECT 1 FROM product_segment s WHERE s.shape_id = x.id AND s.is_canonical AND s.locale = NEW.code)) THEN 'shapes'
    WHEN EXISTS (SELECT 1 FROM option x WHERE NOT EXISTS (SELECT 1 FROM product_segment s WHERE s.option_id = x.id AND s.is_canonical AND s.locale = NEW.code)) THEN 'options'
    WHEN EXISTS (SELECT 1 FROM post p WHERE NOT EXISTS (SELECT 1 FROM post_slug s WHERE s.post_id = p.id AND s.is_canonical AND s.locale = NEW.code)) THEN 'posts'
  END INTO what;
  IF what IS NOT NULL THEN
    RAISE EXCEPTION 'language % has no canonical slug for some % — add its slugs in the same transaction', NEW.code, what USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER locale_has_slugs AFTER INSERT ON locale DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION assert_locale_has_slugs();
--> statement-breakpoint

-- Frozen owners now include the language; category_slug is guarded like the other namespace tables.
DROP TRIGGER product_slug_owner_frozen ON product_slug;
--> statement-breakpoint
CREATE TRIGGER product_slug_owner_frozen     BEFORE UPDATE ON product_slug    FOR EACH ROW EXECUTE FUNCTION forbid_key_change('product_id', 'locale');
--> statement-breakpoint
DROP TRIGGER product_segment_target_frozen ON product_segment;
--> statement-breakpoint
CREATE TRIGGER product_segment_target_frozen BEFORE UPDATE ON product_segment FOR EACH ROW EXECUTE FUNCTION forbid_key_change('product_id', 'shape_id', 'option_id', 'locale');
--> statement-breakpoint
DROP TRIGGER post_slug_owner_frozen ON post_slug;
--> statement-breakpoint
CREATE TRIGGER post_slug_owner_frozen        BEFORE UPDATE ON post_slug       FOR EACH ROW EXECUTE FUNCTION forbid_key_change('post_id', 'locale');
--> statement-breakpoint
CREATE TRIGGER category_slug_owner_frozen    BEFORE UPDATE ON category_slug   FOR EACH ROW EXECUTE FUNCTION forbid_key_change('category_id', 'locale');
--> statement-breakpoint
CREATE TRIGGER category_slug_no_truncate     BEFORE TRUNCATE ON category_slug FOR EACH STATEMENT EXECUTE FUNCTION forbid_truncate();
