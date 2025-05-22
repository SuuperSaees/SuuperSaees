



drop function if exists "public"."get_unread_chat_message_counts"(p_user_id uuid, p_is_agency_role boolean);

drop function if exists "public"."get_unread_order_message_counts"(p_user_id uuid, p_is_agency_role boolean);

drop function if exists "public"."mark_order_messages_as_read"(p_user_id uuid, p_order_id integer);

alter table "public"."message_reads" alter column "message_id" drop not null;

alter table "public"."message_reads" alter column "order_id" set data type bigint using "order_id"::bigint;

alter table "public"."message_reads" alter column "unread_count" set data type bigint using "unread_count"::bigint;






