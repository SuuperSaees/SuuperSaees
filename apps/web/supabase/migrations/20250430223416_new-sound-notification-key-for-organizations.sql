alter type "public"."organization_setting_key" rename to "organization_setting_key__old_version_to_be_dropped";

create type "public"."organization_setting_key" as enum ('theme_color', 'background_color', 'logo_url', 'timezone', 'language', 'date_format', 'sidebar_background_color', 'portal_name', 'favicon_url', 'sender_name', 'sender_email', 'sender_domain', 'logo_dark_url', 'auth_card_background_color', 'auth_section_background_color', 'dashboard_url', 'pinned_organizations', 'catalog_provider_url', 'catalog_product_url', 'tool_copy_list_url', 'auth_background_url', 'parteners_url', 'catalog_product_wholesale_url', 'catalog_product_private_label_url', 'training_url', 'catalog_sourcing_china_url', 'calendar_url', 'notification_sound');

alter table "public"."organization_settings" alter column key type "public"."organization_setting_key" using key::text::"public"."organization_setting_key";

drop type "public"."organization_setting_key__old_version_to_be_dropped";

CREATE INDEX IF NOT EXISTS idx_messages_order_created_at
ON public.messages (created_at)
WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at
ON public.messages (created_at)
WHERE order_id IS NULL AND chat_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_message_reads_user_chat
ON public.message_reads (user_id, chat_id);

DROP FUNCTION IF EXISTS public.get_unread_message_counts(uuid);

CREATE OR REPLACE FUNCTION public.get_unread_message_counts(p_user_id uuid, p_is_agency_role boolean)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint, message_ids uuid[])
 LANGUAGE plpgsql
AS $function$
DECLARE
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone; -- March 11, 2025, 6:04 PM Colombia time (UTC-5)
BEGIN
  
  -- First, return chat counts with message_ids
  RETURN QUERY
  SELECT 
    m.chat_id, 
    COUNT(m.id)::BIGINT AS chat_unread_count,
    NULL::integer AS order_id,
    0::BIGINT AS order_unread_count,
    ARRAY_AGG(m.id) AS message_ids
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
      p_is_agency_role = true  -- Agency roles can see all messages
      OR m.visibility = 'public'  -- Non-agency roles can only see public messages
    )
    AND (
      mr.read_at IS NULL OR 
      m.created_at > mr.read_at
    )
  GROUP BY m.chat_id;
  
-- Then, return order counts with message_ids
  RETURN QUERY
  SELECT 
    NULL::uuid AS chat_id,
    0::BIGINT AS chat_unread_count,
    m.order_id::integer,
    COUNT(m.id)::BIGINT AS order_unread_count,
    ARRAY_AGG(m.id) AS message_ids
  FROM messages m
  LEFT JOIN message_reads mr ON 
    mr.user_id = p_user_id AND 
    mr.order_id = m.order_id::integer  -- Explicit conversion to integer
  WHERE 
    m.order_id IS NOT NULL
    AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
    AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
    AND (
      p_is_agency_role = true  -- Agency roles can see all messages
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

GRANT EXECUTE ON FUNCTION get_unread_message_counts(uuid, boolean) TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.get_unread_order_message_counts(uuid, boolean);

CREATE OR REPLACE FUNCTION public.get_unread_order_message_counts(p_user_id uuid, p_is_agency_role boolean)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint, message_ids uuid[])
 LANGUAGE plpgsql
AS $function$
DECLARE
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone; -- March 11, 2025, 6:04 PM Colombia time (UTC-5)
BEGIN
-- Then, return order counts with message_ids
  RETURN QUERY
  SELECT 
    NULL::uuid AS chat_id,
    0::BIGINT AS chat_unread_count,
    m.order_id::integer,
    COUNT(m.id)::BIGINT AS order_unread_count,
    ARRAY_AGG(m.id) AS message_ids
  FROM messages m
  LEFT JOIN message_reads mr ON 
    mr.user_id = p_user_id AND 
    mr.order_id = m.order_id::integer  -- Explicit conversion to integer
  WHERE 
    m.order_id IS NOT NULL
    AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
    AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
    AND (
      p_is_agency_role = true  -- Agency roles can see all messages
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

GRANT EXECUTE ON FUNCTION get_unread_order_message_counts(uuid, boolean) TO anon, authenticated, service_role;

DROP FUNCTION IF EXISTS public.get_unread_chat_message_counts(uuid, boolean);

CREATE OR REPLACE FUNCTION public.get_unread_chat_message_counts(p_user_id uuid, p_is_agency_role boolean)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint, message_ids uuid[])
 LANGUAGE plpgsql
AS $function$
DECLARE
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone; -- March 11, 2025, 6:04 PM Colombia time (UTC-5)
BEGIN
  
  -- First, return chat counts with message_ids
  RETURN QUERY
  SELECT 
    m.chat_id, 
    COUNT(m.id)::BIGINT AS chat_unread_count,
    NULL::integer AS order_id,
    0::BIGINT AS order_unread_count,
    ARRAY_AGG(m.id) AS message_ids
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
      p_is_agency_role = true  -- Agency roles can see all messages
      OR m.visibility = 'public'  -- Non-agency roles can only see public messages
    )
    AND (
      mr.read_at IS NULL OR 
      m.created_at > mr.read_at
    )
  GROUP BY m.chat_id;
END;
$function$
;

GRANT EXECUTE ON FUNCTION get_unread_chat_message_counts(uuid, boolean) TO anon, authenticated, service_role;
