
drop policy "select_chats" on "public"."chats";

alter table "public"."chats" enable row level security;

set check_function_bodies = off;

create policy "select_chats"
on "public"."chats"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM chat_members cm
  WHERE ((cm.chat_id = chats.id) AND (cm.user_id = auth.uid())))));


