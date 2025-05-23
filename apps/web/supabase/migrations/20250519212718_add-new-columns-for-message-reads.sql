alter table "public"."message_reads" add column "unread_count" bigint;

alter table "public"."message_reads" add column "agency_id" uuid;

alter table "public"."message_reads" add column "client_organization_id" uuid;

alter table "public"."message_reads" alter column "message_id" drop not null;

alter table "public"."message_reads" alter column "order_id" set data type bigint using "order_id"::bigint;


drop function if exists "public"."get_unread_chat_message_counts"(p_user_id uuid, p_is_agency_role boolean);

drop function if exists "public"."get_unread_order_message_counts"(p_user_id uuid, p_is_agency_role boolean);

drop function if exists "public"."mark_order_messages_as_read"(p_user_id uuid, p_order_id integer);


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
    AND mr.unread_count > 0
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
  v_old_is_special boolean;
  v_new_is_special boolean;
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

    IF TG_TABLE_NAME = 'chat_members' THEN
      -- Only check deleted_on for chat_members since other tables don't have this field
      IF NEW.deleted_on IS NULL THEN
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
  END IF;

  -- === DELETE ===
  IF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'order_followers' THEN
      -- Only delete if user is NOT a client_owner for this order's client organization
      DELETE FROM message_reads mr
      WHERE mr.user_id = OLD.client_member_id
        AND mr.order_id = OLD.order_id
        AND NOT EXISTS (
          SELECT 1 FROM accounts_memberships am
          WHERE am.user_id = OLD.client_member_id
            AND am.organization_id = mr.client_organization_id
            AND am.account_role = 'client_owner'
        );
    ELSIF TG_TABLE_NAME = 'order_assignations' THEN
      -- Only delete if user is NOT agency_owner or agency_project_manager for this order's agency
      DELETE FROM message_reads mr
      WHERE mr.user_id = OLD.agency_member_id
        AND mr.order_id = OLD.order_id
        AND NOT EXISTS (
          SELECT 1 FROM accounts_memberships am
          WHERE am.user_id = OLD.agency_member_id
            AND am.organization_id = mr.agency_id
            AND am.account_role IN ('agency_owner', 'agency_project_manager')
        );
    ELSIF TG_TABLE_NAME = 'chat_members' THEN
      -- Only delete if user is NOT a special role for this chat's organizations
      DELETE FROM message_reads mr
      WHERE mr.user_id = OLD.user_id
        AND mr.chat_id = OLD.chat_id
        AND NOT EXISTS (
          SELECT 1 FROM accounts_memberships am
          WHERE am.user_id = OLD.user_id
            AND (
              (mr.agency_id IS NOT NULL AND am.organization_id = mr.agency_id AND am.account_role IN ('agency_owner', 'agency_project_manager')) OR
              (mr.client_organization_id IS NOT NULL AND am.organization_id = mr.client_organization_id AND am.account_role = 'client_owner')
            )
        );
    END IF;
  END IF;

  -- === UPDATE === 
  IF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'chat_members' THEN
      -- Handle soft delete/restore for chat_members
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
    ELSIF TG_TABLE_NAME = 'accounts_memberships' THEN
      -- Handle role changes
      IF OLD.account_role != NEW.account_role THEN
        -- Check if roles are special
        v_old_is_special := OLD.account_role IN ('agency_owner', 'agency_project_manager', 'client_owner');
        v_new_is_special := NEW.account_role IN ('agency_owner', 'agency_project_manager', 'client_owner');

        -- Case 1: FROM special role TO regular role - cleanup
        IF v_old_is_special AND NOT v_new_is_special THEN
          -- Remove entries where user doesn't have explicit membership
          DELETE FROM message_reads mr
          WHERE mr.user_id = NEW.user_id
            AND (
              -- For orders: keep only if user is in order_followers or order_assignations
              (mr.order_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM order_followers of WHERE of.client_member_id = NEW.user_id AND of.order_id = mr.order_id
                UNION
                SELECT 1 FROM order_assignations oa WHERE oa.agency_member_id = NEW.user_id AND oa.order_id = mr.order_id
              )) OR
              -- For chats: keep only if user is in chat_members
              (mr.chat_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM chat_members cm WHERE cm.user_id = NEW.user_id AND cm.chat_id = mr.chat_id AND cm.deleted_on IS NULL
              ))
            );

        -- Case 2: FROM regular role TO special role - add all relevant
        ELSIF NOT v_old_is_special AND v_new_is_special THEN
          -- Add to all orders for the organization
          IF NEW.account_role IN ('agency_owner', 'agency_project_manager') THEN
            -- Add to all orders where this organization is the agency
            INSERT INTO message_reads (user_id, order_id, agency_id, unread_count)
            SELECT NEW.user_id, o.id, NEW.organization_id, 0
            FROM orders_v2 o
            WHERE o.agency_id = NEW.organization_id
            ON CONFLICT DO NOTHING;

            -- Add to all chats where this organization is the agency
            INSERT INTO message_reads (user_id, chat_id, agency_id, unread_count)
            SELECT NEW.user_id, c.id, NEW.organization_id, 0
            FROM chats c
            WHERE c.agency_id = NEW.organization_id
            ON CONFLICT DO NOTHING;

          ELSIF NEW.account_role = 'client_owner' THEN
            -- Add to all orders where this organization is the client
            INSERT INTO message_reads (user_id, order_id, client_organization_id, unread_count)
            SELECT NEW.user_id, o.id, NEW.organization_id, 0
            FROM orders_v2 o
            WHERE o.client_organization_id = NEW.organization_id
            ON CONFLICT DO NOTHING;

            -- Add to all chats where this organization is the client
            INSERT INTO message_reads (user_id, chat_id, client_organization_id, unread_count)
            SELECT NEW.user_id, c.id, NEW.organization_id, 0
            FROM chats c
            WHERE c.client_organization_id = NEW.organization_id
            ON CONFLICT DO NOTHING;
          END IF;
        END IF;
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



-- Remaining: role swap and delete notifications. One options is add message_reads to all users when assignation ocurrs or like im
-- doing right now, but that might be a lot of rows to insert in the case of a role swap.

-- Other case to handle is read-add users to message_reads when a new message is created.
-- This applies on cases where the users not belong anymore due to they not exist because the last message was too long ago.


-- Current Flow Solution:
-- Multiple triggers ensure only certain users are added to message_reads in assignations, followers, and chat_members cases.
-- This ensures only relevant users are added and reduces unnecessary rows.
-- Problem:
-- This add complexity to the code and might not be scalable.
-- The complexity comes from the need to handle different cases and ensure only the correct users are added.
-- Example 1: 
-- - When the role is changed u need ensure the user is only added to message_reads for the orders they might have access to.
-- Roles like agency_owner, agency_project_manager, client_owner, are assigned to all the orders and chats. 
-- This means that the user will be added to message_reads for all the orders and chats they might not have access to.
-- And for the removal is the same.
-- Example 2:
-- There might be cases where users have been removed from the message_reads table because the last message was too long ago. Or, 
-- simply for other reason not exist anymore.
-- In this case, the user should be added to message_reads again when a new message is created.

-- Conclusion:
-- The current flow solution is a good solution because it handles multiple cases and ensures only the correct users are added.
-- The problem is its complexity and the need to handle different cases, which can introduce bugs and make the code harder to maintain.
-- Also, this solution needs to be complemented with a cleanup process to remove users from message_reads.

-- Alternative Flow Solution:
-- Just one trigger for chats and orders. That adds all the users of an organization (client and agency) to message_reads for the orders and chats.
-- Also on the remove of a chat or order, the users are removed from message_reads.
-- This solution offers:
-- Benefit: Less complex code and easier to maintain and simpler, since we don't need to handle different cases and don't care about removal or role changes.
-- Problem:
-- The problem is that we are adding a lot of unnecessary users to message_reads.
-- This is because we are adding all the users of an organization to message_reads for the orders and chats.
-- This means that we are adding users that might not have access to the orders and chats.
-- This is a problem because it can cause performance issues and it can cause unnecessary rows in the message_reads table. 
-- So, this table (message_reads) will grow a lot and eventually will need to be cleaned up.

-- Conclusion: This alternative is a good solution only if we complement it with a cleanup process.
-- Plan for this: use supabase cron jobs or scheduled triggers to clean up the message_reads when the last message was too long ago. 
-- In that solution we have to check chats and orders and its messages.
-- Other complementary proccess is for real-time updates when need to add RLS to the message_reads table.
-- This ensures that despite all users are added to the message_reads table, only the users with access to the orders and chats are able to be notified.

-- Resources:
-- https://supabase.com/docs/guides/functions/schedule-functions
-- https://supabase.com/modules/cron