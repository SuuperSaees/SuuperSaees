drop policy if exists "delete_chats"
on "public"."chats";

drop policy if exists "insert_chats"
on "public"."chats";

drop policy if exists "select_chats"
on "public"."chats";

drop policy if exists "update_chats"
on "public"."chats";

alter table "public"."chats" disable row level security;

create policy "delete_chats"
on "public"."chats"
as permissive
for delete
to public
using (true);


create policy "insert_chats"
on "public"."chats"
as permissive
for insert
to public
with check (true);


create policy "select_chats"
on "public"."chats"
as permissive
for select
to public
using (true);


create policy "update_chats"
on "public"."chats"
as permissive
for update
to public
using (true);
