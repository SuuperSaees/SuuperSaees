-- Check and remove constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_reads_message_id_user_id_key' 
    AND conrelid = 'public.message_reads'::regclass
  ) THEN
    ALTER TABLE "public"."message_reads" DROP CONSTRAINT "message_reads_message_id_user_id_key";
  END IF;
END
$$;

-- Safely drop existing functions
DROP FUNCTION IF EXISTS "public"."mark_messages_as_read"(p_chat_id uuid, p_user_id uuid);

-- Drop index if exists
DROP INDEX IF EXISTS "public"."message_reads_message_id_user_id_key";

-- Add columns only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'message_reads' 
    AND column_name = 'chat_id'
  ) THEN
    ALTER TABLE "public"."message_reads" ADD COLUMN "chat_id" uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'message_reads' 
    AND column_name = 'order_id'
  ) THEN
    ALTER TABLE "public"."message_reads" ADD COLUMN "order_id" integer;
  END IF;
END
$$;

-- Create indexes only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'message_reads_chat_id_idx'
  ) THEN
    CREATE INDEX message_reads_chat_id_idx ON public.message_reads USING btree (chat_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'message_reads_order_id_idx'
  ) THEN
    CREATE INDEX message_reads_order_id_idx ON public.message_reads USING btree (order_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'message_reads_user_id_chat_id_key'
  ) THEN
    CREATE UNIQUE INDEX message_reads_user_id_chat_id_key ON public.message_reads USING btree (user_id, chat_id) WHERE (chat_id IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'message_reads_user_id_order_id_key'
  ) THEN
    CREATE UNIQUE INDEX message_reads_user_id_order_id_key ON public.message_reads USING btree (user_id, order_id) WHERE (order_id IS NOT NULL);
  END IF;
END
$$;

-- Add constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chat_or_order_not_both' 
    AND conrelid = 'public.message_reads'::regclass
  ) THEN
    ALTER TABLE "public"."message_reads" ADD CONSTRAINT "chat_or_order_not_both" CHECK (((chat_id IS NULL) OR (order_id IS NULL))) not valid;
    ALTER TABLE "public"."message_reads" VALIDATE CONSTRAINT "chat_or_order_not_both";
  END IF;
END
$$;

-- Configuration for function creation
SET check_function_bodies = off;

-- Create or replace functions (this is safe since DROP IF EXISTS was executed before)
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_user_id uuid, p_chat_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_latest_message_id UUID;
  v_count INTEGER;
BEGIN
  -- Find the latest message in the chat
  SELECT id INTO v_latest_message_id
  FROM messages
  WHERE chat_id = p_chat_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_latest_message_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Insert or update the last read position
  INSERT INTO message_reads (user_id, chat_id, message_id, read_at)
  VALUES (p_user_id, p_chat_id, v_latest_message_id, NOW())
  ON CONFLICT (user_id, chat_id) WHERE chat_id IS NOT NULL
  DO UPDATE SET 
    message_id = v_latest_message_id,
    read_at = NOW();
  
  -- Count how many messages were effectively marked as read
  SELECT COUNT(*) INTO v_count
  FROM messages m
  WHERE m.chat_id = p_chat_id
    AND m.user_id != p_user_id
    AND m.created_at >= (
      SELECT COALESCE(
        (SELECT read_at FROM message_reads 
         WHERE user_id = p_user_id AND chat_id = p_chat_id),
        '1970-01-01'::timestamp
      )
    );
  
  RETURN v_count;
END;
$function$
;

-- Remove existing get_unread_message_counts function
DROP FUNCTION IF EXISTS public.get_unread_message_counts(uuid);

-- Create the new get_unread_message_counts function
CREATE OR REPLACE FUNCTION public.get_unread_message_counts(p_user_id uuid)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint)
 LANGUAGE plpgsql
AS $function$
DECLARE
  is_agency_role boolean;
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone;
BEGIN
  -- Check if the user has any agency role
  SELECT EXISTS (
    SELECT 1 
    FROM accounts_memberships am 
    WHERE am.user_id = p_user_id 
    AND am.account_role IN ('agency_owner', 'agency_member', 'agency_project_manager')
  ) INTO is_agency_role;

  -- First, return chat counts
  RETURN QUERY
  SELECT 
    m.chat_id, 
    COUNT(m.id)::BIGINT AS chat_unread_count,
    NULL::integer AS order_id,
    0::BIGINT AS order_unread_count
  FROM messages m
  JOIN chats c ON m.chat_id = c.id  -- Join with chats to ensure chat exists
  LEFT JOIN message_reads mr ON 
    mr.user_id = p_user_id AND 
    mr.chat_id = m.chat_id
  WHERE 
    m.chat_id IS NOT NULL
    AND m.order_id IS NULL  -- Exclude order-related messages
    AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
    AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
    AND (
      is_agency_role = true  -- Agency roles can see all messages
      OR m.visibility = 'public'  -- Non-agency roles can only see public messages
    )
    AND (
      mr.read_at IS NULL OR 
      m.created_at > mr.read_at
    )
  GROUP BY m.chat_id;

  -- Then, return order counts
  RETURN QUERY
  SELECT 
    NULL::uuid AS chat_id,
    0::BIGINT AS chat_unread_count,
    m.order_id::integer,
    COUNT(m.id)::BIGINT AS order_unread_count
  FROM messages m
  LEFT JOIN message_reads mr ON 
    mr.user_id = p_user_id AND 
    mr.order_id = m.order_id::integer  -- Explicit conversion to integer
  WHERE 
    m.order_id IS NOT NULL
    AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
    AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
    AND (
      is_agency_role = true  -- Agency roles can see all messages
      OR m.visibility = 'public'  -- Non-agency roles can only see public messages
    )
    AND (
      mr.read_at IS NULL OR 
      m.created_at > mr.read_at
    )
  GROUP BY m.order_id;
END;
$function$
;

-- Create the mark_order_messages_as_read function
DROP FUNCTION IF EXISTS "public"."mark_order_messages_as_read"(p_user_id uuid, p_order_id integer);
CREATE OR REPLACE FUNCTION public.mark_order_messages_as_read(p_user_id uuid, p_order_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_latest_message_id UUID;
  v_count INTEGER;
BEGIN
  -- Find the latest message in the order
  SELECT id INTO v_latest_message_id
  FROM messages
  WHERE order_id = p_order_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_latest_message_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Insert or update the last read position
  INSERT INTO message_reads (user_id, order_id, message_id, read_at)
  VALUES (p_user_id, p_order_id, v_latest_message_id, NOW())
  ON CONFLICT (user_id, order_id) WHERE order_id IS NOT NULL
  DO UPDATE SET 
    message_id = v_latest_message_id,
    read_at = NOW();
  
  -- Count how many messages were effectively marked as read
  SELECT COUNT(*) INTO v_count
  FROM messages m
  WHERE m.order_id = p_order_id
    AND m.user_id != p_user_id
    AND m.created_at >= (
      SELECT COALESCE(
        (SELECT read_at FROM message_reads 
         WHERE user_id = p_user_id AND order_id = p_order_id),
        '1970-01-01'::timestamp
      )
    );
  
  RETURN v_count;
END;
$function$
;

GRANT EXECUTE ON FUNCTION public.mark_messages_as_read(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_unread_message_counts(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_messages_as_read(uuid, integer) TO anon, authenticated, service_role;