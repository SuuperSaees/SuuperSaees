set check_function_bodies = off;

DROP FUNCTION IF EXISTS public.get_unread_message_counts(uuid);

CREATE OR REPLACE FUNCTION public.get_unread_message_counts(p_user_id uuid)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint, message_ids uuid[])
 LANGUAGE plpgsql
AS $function$
DECLARE
  is_agency_role boolean;
  v_org_id uuid;
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone; -- March 11, 2025, 6:04 PM Colombia time (UTC-5)
BEGIN
  -- Get the organization ID from the session
  SELECT get_current_organization_id() INTO v_org_id;
  
  -- Check if the user has any agency role within the current organization
  SELECT EXISTS (
    SELECT 1 
    FROM accounts_memberships am
    WHERE am.user_id = p_user_id 
    AND am.organization_id = v_org_id
    AND am.account_role IN ('agency_owner', 'agency_member', 'agency_project_manager')
  ) INTO is_agency_role;

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
      is_agency_role = true  -- Agency roles can see all messages
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

GRANT EXECUTE ON FUNCTION get_unread_message_counts(uuid) TO anon, authenticated, service_role;

