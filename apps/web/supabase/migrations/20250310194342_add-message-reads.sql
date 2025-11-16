

create table "public"."message_reads" (
    "id" uuid not null default uuid_generate_v4(),
    "message_id" uuid not null,
    "user_id" uuid not null,
    "read_at" timestamp with time zone default now()
);



CREATE INDEX message_reads_message_id_idx ON public.message_reads USING btree (message_id);

CREATE UNIQUE INDEX message_reads_message_id_user_id_key ON public.message_reads USING btree (message_id, user_id);

CREATE UNIQUE INDEX message_reads_pkey ON public.message_reads USING btree (id);

CREATE INDEX message_reads_user_id_idx ON public.message_reads USING btree (user_id);


alter table "public"."message_reads" add constraint "message_reads_pkey" PRIMARY KEY using index "message_reads_pkey";

alter table "public"."message_reads" add constraint "message_reads_message_id_fkey" FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE not valid;

alter table "public"."message_reads" validate constraint "message_reads_message_id_fkey";

alter table "public"."message_reads" add constraint "message_reads_message_id_user_id_key" UNIQUE using index "message_reads_message_id_user_id_key";

alter table "public"."message_reads" add constraint "message_reads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."message_reads" validate constraint "message_reads_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_unread_message_counts(p_user_id uuid)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint)
 LANGUAGE plpgsql
AS $function$
DECLARE
  is_agency_role boolean;
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone; -- March 11, 2025, 6:04 PM Colombia time (UTC-5)
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
  WHERE m.chat_id IS NOT NULL
  AND m.order_id IS NULL  -- Exclude order-related messages
  AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
  AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
  AND (
    is_agency_role = true  -- Agency roles can see all messages
    OR m.visibility = 'public'  -- Non-agency roles can only see public messages
  )
  AND NOT EXISTS (
    SELECT 1 FROM message_reads mr 
    WHERE mr.message_id = m.id AND mr.user_id = p_user_id
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
  WHERE m.order_id IS NOT NULL
  AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
  AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
  AND (
    is_agency_role = true  -- Agency roles can see all messages
    OR m.visibility = 'public'  -- Non-agency roles can only see public messages
  )
  AND NOT EXISTS (
    SELECT 1 FROM message_reads mr 
    WHERE mr.message_id = m.id AND mr.user_id = p_user_id
  )
  GROUP BY m.order_id;
END;
$function$
;


CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_chat_id UUID,
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert message_reads for all unread messages in the chat
  INSERT INTO message_reads (message_id, user_id, read_at)
  SELECT 
    m.id, 
    p_user_id, 
    NOW()
  FROM 
    messages m
  LEFT JOIN 
    message_reads mr ON m.id = mr.message_id AND mr.user_id = p_user_id
  WHERE 
    m.chat_id = p_chat_id
    AND m.user_id != p_user_id
    AND mr.id IS NULL;
    
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.mark_order_messages_as_read(p_user_id uuid, p_order_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert message read records for all unread messages in the specified order
  INSERT INTO message_reads (user_id, message_id)
  SELECT p_user_id, m.id
  FROM messages m
  WHERE m.order_id = p_order_id
  AND m.user_id != p_user_id  -- Don't mark your own messages as read
  AND NOT EXISTS (
    SELECT 1 FROM message_reads mr 
    WHERE mr.message_id = m.id AND mr.user_id = p_user_id
  );
END;
$function$
;

grant delete on table "public"."message_reads" to "anon";

grant insert on table "public"."message_reads" to "anon";

grant references on table "public"."message_reads" to "anon";

grant select on table "public"."message_reads" to "anon";

grant trigger on table "public"."message_reads" to "anon";

grant truncate on table "public"."message_reads" to "anon";

grant update on table "public"."message_reads" to "anon";

grant delete on table "public"."message_reads" to "authenticated";

grant insert on table "public"."message_reads" to "authenticated";

grant references on table "public"."message_reads" to "authenticated";

grant select on table "public"."message_reads" to "authenticated";

grant trigger on table "public"."message_reads" to "authenticated";

grant truncate on table "public"."message_reads" to "authenticated";

grant update on table "public"."message_reads" to "authenticated";

grant delete on table "public"."message_reads" to "service_role";

grant insert on table "public"."message_reads" to "service_role";

grant references on table "public"."message_reads" to "service_role";

grant select on table "public"."message_reads" to "service_role";

grant trigger on table "public"."message_reads" to "service_role";

grant truncate on table "public"."message_reads" to "service_role";

grant update on table "public"."message_reads" to "service_role";

grant execute on function public.get_unread_message_counts(uuid) to anon;
grant execute on function public.get_unread_message_counts(uuid) to authenticated;
grant execute on function public.get_unread_message_counts(uuid) to service_role;

grant execute on function public.mark_messages_as_read(uuid, uuid) to anon;
grant execute on function public.mark_messages_as_read(uuid, uuid) to authenticated;
grant execute on function public.mark_messages_as_read(uuid, uuid) to service_role;

grant execute on function public.mark_order_messages_as_read(uuid, integer) to anon;
grant execute on function public.mark_order_messages_as_read(uuid, integer) to authenticated;
grant execute on function public.mark_order_messages_as_read(uuid, integer) to service_role;



