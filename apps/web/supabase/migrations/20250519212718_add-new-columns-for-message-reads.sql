alter table "public"."message_reads" add column "unread_count" bigint;

alter table "public"."message_reads" add column "agency_id" uuid;

alter table "public"."message_reads" add column "client_organization_id" uuid;

alter table "public"."message_reads" alter column "message_id" drop not null;

alter table "public"."message_reads" alter column "order_id" set data type bigint using "order_id"::bigint;


drop function if exists "public"."get_unread_chat_message_counts"(p_user_id uuid, p_is_agency_role boolean);

drop function if exists "public"."get_unread_order_message_counts"(p_user_id uuid, p_is_agency_role boolean);

drop function if exists "public"."mark_order_messages_as_read"(p_user_id uuid, p_order_id integer);

-- First migration create an entrance for each user member in the chat or order
-- Ensure one row per chat_id per user
ALTER TABLE message_reads
ADD CONSTRAINT unique_user_chat UNIQUE (user_id, chat_id);

-- Ensure one row per order_id per user
ALTER TABLE message_reads
ADD CONSTRAINT unique_user_order UNIQUE (user_id, order_id);

-- DO $$
-- DECLARE
--   cutoff_date timestamp with time zone := NOW() - INTERVAL '2 months';
-- BEGIN
--   -- Step 1: Prepopulate for chat members
--   WITH recent_chats AS (
--     SELECT * FROM chats WHERE created_at >= cutoff_date
--   ),
--   latest_chat_messages AS (
--     SELECT DISTINCT ON (m.chat_id) m.chat_id, m.id AS message_id
--     FROM messages m
--     WHERE m.chat_id IS NOT NULL
--     ORDER BY m.chat_id, m.created_at DESC
--   ),
--   chat_data AS (
--     SELECT
--       cm.user_id,
--       rc.id AS chat_id,
--       lcm.message_id,
--       am.account_role,
--       am.organization_id
--     FROM recent_chats rc
--     JOIN chat_members cm ON cm.chat_id = rc.id
--     LEFT JOIN latest_chat_messages lcm ON lcm.chat_id = rc.id
--     JOIN accounts_memberships am ON am.user_id = cm.user_id
--   )
--   INSERT INTO message_reads (
--     user_id,
--     chat_id,
--     agency_id,
--     client_organization_id,
--     message_id,
--     unread_count
--   )
--   SELECT
--     cd.user_id,
--     cd.chat_id,
--     CASE WHEN cd.account_role LIKE 'agency_%' THEN cd.organization_id ELSE NULL END,
--     CASE WHEN cd.account_role LIKE 'client_%' THEN cd.organization_id ELSE NULL END,
--     cd.message_id,
--     0
--   FROM chat_data cd
--   WHERE cd.message_id IS NOT NULL
--   ON CONFLICT (user_id, chat_id) DO NOTHING;

--   -- Step 2: Prepopulate for order followers and assignees
--   WITH recent_orders AS (
--     SELECT * FROM orders_v2 WHERE created_at >= cutoff_date
--   ),
--   latest_order_messages AS (
--     SELECT DISTINCT ON (m.order_id) m.order_id, m.id AS message_id
--     FROM messages m
--     WHERE m.order_id IS NOT NULL
--     ORDER BY m.order_id, m.created_at DESC
--   ),
--   order_users AS (
--     SELECT client_member_id AS user_id, order_id FROM order_followers
--     UNION
--     SELECT agency_member_id AS user_id, order_id FROM order_assignations
--   ),
--   order_data AS (
--     SELECT
--       ou.user_id,
--       ro.id AS order_id,
--       lom.message_id,
--       am.account_role,
--       am.organization_id
--     FROM recent_orders ro
--     JOIN order_users ou ON ou.order_id = ro.id
--     LEFT JOIN latest_order_messages lom ON lom.order_id = ro.id
--     JOIN accounts_memberships am ON am.user_id = ou.user_id
--   )
--   INSERT INTO message_reads (
--     user_id,
--     order_id,
--     agency_id,
--     client_organization_id,
--     message_id,
--     unread_count
--   )
--   SELECT
--     od.user_id,
--     od.order_id,
--     CASE WHEN od.account_role LIKE 'agency_%' THEN od.organization_id ELSE NULL END,
--     CASE WHEN od.account_role LIKE 'client_%' THEN od.organization_id ELSE NULL END,
--     od.message_id,
--     0
--   FROM order_data od
--   WHERE od.message_id IS NOT NULL
--   ON CONFLICT (user_id, order_id) DO NOTHING;
-- END;
-- $$;



-- -- Second migration: Backfill from orders_v2
-- BEGIN;

-- -- Step 1: Backfill from orders_v2
-- UPDATE message_reads AS mr
-- SET
--   agency_id = CASE
--     WHEN am.account_role IN ('agency_owner', 'agency_project_manager', 'agency_member')
--       THEN o.agency_id
--     ELSE NULL
--   END,
--   client_organization_id = CASE
--     WHEN am.account_role IN ('client_owner', 'client_member')
--       THEN o.client_organization_id
--     ELSE NULL
--   END
-- FROM orders_v2 o,
--      accounts_memberships am
-- WHERE mr.order_id IS NOT NULL
--   AND o.id = mr.order_id
--   AND am.user_id = mr.user_id
--   AND am.organization_id IN (o.agency_id, o.client_organization_id);

-- -- Step 2: Backfill from chats
-- UPDATE message_reads AS mr
-- SET
--   agency_id = CASE
--     WHEN am.account_role IN ('agency_owner', 'agency_project_manager', 'agency_member')
--       THEN c.agency_id
--     ELSE NULL
--   END,
--   client_organization_id = CASE
--     WHEN am.account_role IN ('client_owner', 'client_member')
--       THEN c.client_organization_id
--     ELSE NULL
--   END
-- FROM chats c,
--      accounts_memberships am
-- WHERE mr.order_id IS NULL
--   AND mr.chat_id IS NOT NULL
--   AND c.id = mr.chat_id
--   AND am.user_id = mr.user_id
--   AND am.organization_id IN (c.agency_id, c.client_organization_id);

-- COMMIT;


-- -- Third migration: Update unread_count

-- DO $$
-- DECLARE
--   mr_user RECORD;
--   is_agency BOOLEAN;
--   unread_row RECORD;
-- BEGIN
--   FOR mr_user IN 
--     SELECT DISTINCT user_id, agency_id, client_organization_id 
--     FROM message_reads
--   LOOP
--     -- Determine role type from message_reads
--     is_agency := mr_user.agency_id IS NOT NULL AND mr_user.client_organization_id IS NULL;

--     -- Get unread counts using existing function
--     FOR unread_row IN 
--       SELECT * FROM get_unread_message_counts(mr_user.user_id, is_agency)
--     LOOP
--       IF unread_row.chat_id IS NOT NULL THEN
--         UPDATE message_reads
--         SET unread_count = unread_row.chat_unread_count
--         WHERE user_id = mr_user.user_id
--           AND chat_id = unread_row.chat_id;

--       ELSIF unread_row.order_id IS NOT NULL THEN
--         UPDATE message_reads
--         SET unread_count = unread_row.order_unread_count
--         WHERE user_id = mr_user.user_id
--           AND order_id = unread_row.order_id;
--       END IF;
--     END LOOP;
--   END LOOP;
-- END;
-- $$;


DROP FUNCTION IF EXISTS public.get_unread_message_counts(uuid, boolean);

CREATE OR REPLACE FUNCTION public.get_unread_message_counts(
  p_user_id uuid,
  p_organization_id uuid,
  p_role text,
  p_target text DEFAULT NULL  -- 'orders' | 'chats' | NULL
)
RETURNS TABLE(
  chat_id uuid,
  chat_unread_count bigint,
  order_id bigint,
  order_unread_count bigint
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    mr.chat_id,
    CASE WHEN mr.chat_id IS NOT NULL THEN mr.unread_count ELSE 0 END AS chat_unread_count,
    mr.order_id,
    CASE WHEN mr.order_id IS NOT NULL THEN mr.unread_count ELSE 0 END AS order_unread_count
  FROM message_reads mr
  WHERE
    mr.user_id = p_user_id
    AND (
      (p_role LIKE 'agency_%' AND mr.agency_id = p_organization_id)
      OR
      (p_role LIKE 'client_%' AND mr.client_organization_id = p_organization_id)
    )
    AND (
      p_target IS NULL OR
      (p_target = 'orders' AND mr.order_id IS NOT NULL) OR
      (p_target = 'chats' AND mr.chat_id IS NOT NULL)
    );
END;
$function$;


GRANT EXECUTE ON FUNCTION get_unread_message_counts(uuid, uuid, text, text) TO anon, authenticated, service_role;


-- New function for mark messages as read
DROP FUNCTION IF EXISTS "public"."mark_messages_as_read"(p_user_id uuid, p_chat_id uuid);

CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_user_id uuid,
  p_organization_id uuid,
  p_role text,
  p_chat_id uuid DEFAULT NULL,
  p_order_id bigint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Update message_reads to reset unread count and set read_at timestamp
  UPDATE message_reads
  SET 
    unread_count = 0,
    read_at = NOW()
  WHERE user_id = p_user_id
    AND (
      (p_chat_id IS NOT NULL AND chat_id = p_chat_id) OR
      (p_order_id IS NOT NULL AND order_id = p_order_id)
    )
    AND (
      (p_role LIKE 'agency_%' AND agency_id = p_organization_id) OR
      (p_role LIKE 'client_%' AND client_organization_id = p_organization_id)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_messages_as_read(uuid, uuid, text, uuid, bigint) TO authenticated, service_role;

-- Trigger for update/insert and increment unread_count on message_reads
CREATE OR REPLACE FUNCTION public.increment_unread_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.chat_id IS NOT NULL THEN
    UPDATE message_reads
    SET unread_count = unread_count + 1,
        message_id = NEW.id
    WHERE chat_id = NEW.chat_id
      AND user_id != NEW.user_id;

  ELSIF NEW.order_id IS NOT NULL THEN
    UPDATE message_reads
    SET unread_count = unread_count + 1,
        message_id = NEW.id
    WHERE order_id = NEW.order_id
      AND user_id != NEW.user_id;
  END IF;

  RETURN NULL; -- after trigger
END;
$$;


DROP TRIGGER IF EXISTS trg_increment_unread ON messages;

CREATE TRIGGER trg_increment_unread
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION public.increment_unread_count();


-- Trigger for insert intiialize user rows when an assignation, or creation of an account ocurrs (necessary for special permissions if assignation not ocurrs)
CREATE OR REPLACE FUNCTION public.upsert_message_reads()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_role text;
  v_org_id uuid;
  v_agency_id uuid;
  v_client_org_id uuid;
  v_user_id uuid;
BEGIN
  -- === INSERT ===
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'order_followers' THEN
      SELECT am.account_role, am.organization_id INTO v_role, v_org_id
      FROM accounts_memberships am
      WHERE am.user_id = NEW.client_member_id
      LIMIT 1;

      IF v_role LIKE 'client_%' THEN
        INSERT INTO message_reads (user_id, order_id, client_organization_id, unread_count)
        VALUES (NEW.client_member_id, NEW.order_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      END IF;

      -- Add ALL client_owner and client_followers from same org
      FOR v_user_id IN
        SELECT user_id FROM accounts_memberships
        WHERE organization_id = v_org_id
          AND account_role IN ('client_owner', 'client_followers')
      LOOP
        INSERT INTO message_reads (user_id, order_id, client_organization_id, unread_count)
        VALUES (v_user_id, NEW.order_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    IF TG_TABLE_NAME = 'order_assignations' THEN
      SELECT am.account_role, am.organization_id INTO v_role, v_org_id
      FROM accounts_memberships am
      WHERE am.user_id = NEW.agency_member_id
      LIMIT 1;

      IF v_role LIKE 'agency_%' THEN
        INSERT INTO message_reads (user_id, order_id, agency_id, unread_count)
        VALUES (NEW.agency_member_id, NEW.order_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      END IF;

      -- Add ALL agency_project_manager from same agency
      FOR v_user_id IN
        SELECT user_id FROM accounts_memberships
        WHERE organization_id = v_org_id
          AND account_role = 'agency_project_manager'
      LOOP
        INSERT INTO message_reads (user_id, order_id, agency_id, unread_count)
        VALUES (v_user_id, NEW.order_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    IF TG_TABLE_NAME = 'chat_members' AND NEW.deleted_on IS NULL THEN
      SELECT c.agency_id, c.client_organization_id INTO v_agency_id, v_client_org_id
      FROM chats c WHERE c.id = NEW.chat_id;

      SELECT am.account_role, am.organization_id INTO v_role, v_org_id
      FROM accounts_memberships am
      WHERE am.user_id = NEW.user_id
      LIMIT 1;

      IF v_role LIKE 'agency_%' AND v_org_id = v_agency_id THEN
        INSERT INTO message_reads (user_id, chat_id, agency_id, unread_count)
        VALUES (NEW.user_id, NEW.chat_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      ELSIF v_role LIKE 'client_%' AND v_org_id = v_client_org_id THEN
        INSERT INTO message_reads (user_id, chat_id, client_organization_id, unread_count)
        VALUES (NEW.user_id, NEW.chat_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;

  -- === DELETE ===
  IF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'order_followers' THEN
      DELETE FROM message_reads
      WHERE user_id = OLD.client_member_id
        AND order_id = OLD.order_id;
    ELSIF TG_TABLE_NAME = 'order_assignations' THEN
      DELETE FROM message_reads
      WHERE user_id = OLD.agency_member_id
        AND order_id = OLD.order_id;
    ELSIF TG_TABLE_NAME = 'chat_members' THEN
      DELETE FROM message_reads
      WHERE user_id = OLD.user_id
        AND chat_id = OLD.chat_id;
    END IF;
  END IF;

  -- === UPDATE === (only needed for chat_members for deleted_on changes)
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'chat_members' THEN
    IF OLD.deleted_on IS NULL AND NEW.deleted_on IS NOT NULL THEN
      -- Soft delete: remove
      DELETE FROM message_reads
      WHERE user_id = OLD.user_id
        AND chat_id = OLD.chat_id;
    ELSIF OLD.deleted_on IS NOT NULL AND NEW.deleted_on IS NULL THEN
      -- Restore: insert
      SELECT c.agency_id, c.client_organization_id INTO v_agency_id, v_client_org_id
      FROM chats c WHERE c.id = NEW.chat_id;

      SELECT am.account_role, am.organization_id INTO v_role, v_org_id
      FROM accounts_memberships am
      WHERE am.user_id = NEW.user_id
      LIMIT 1;

      IF v_role LIKE 'agency_%' AND v_org_id = v_agency_id THEN
        INSERT INTO message_reads (user_id, chat_id, agency_id, unread_count)
        VALUES (NEW.user_id, NEW.chat_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      ELSIF v_role LIKE 'client_%' AND v_org_id = v_client_org_id THEN
        INSERT INTO message_reads (user_id, chat_id, client_organization_id, unread_count)
        VALUES (NEW.user_id, NEW.chat_id, v_org_id, 0)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;


-- For client members
DROP TRIGGER IF EXISTS trg_message_reads_order_followers ON order_followers;
CREATE TRIGGER trg_message_reads_order_followers
AFTER INSERT OR DELETE ON order_followers
FOR EACH ROW
EXECUTE FUNCTION public.upsert_message_reads();

-- For agency members
DROP TRIGGER IF EXISTS trg_message_reads_order_assignations ON order_assignations;
CREATE TRIGGER trg_message_reads_order_assignations
AFTER INSERT OR DELETE ON order_assignations
FOR EACH ROW
EXECUTE FUNCTION public.upsert_message_reads();

-- For chat members (needs UPDATE for soft delete)
DROP TRIGGER IF EXISTS trg_message_reads_chat_members ON chat_members;
CREATE TRIGGER trg_message_reads_chat_members
AFTER INSERT OR DELETE OR UPDATE ON chat_members
FOR EACH ROW
EXECUTE FUNCTION public.upsert_message_reads();



