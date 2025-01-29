drop policy "delete_chats" on "public"."chats";

drop policy "insert_chats" on "public"."chats";

drop policy "select_chats" on "public"."chats";

drop policy "update_chats" on "public"."chats";

alter table "public"."chats" drop constraint "chats_account_id_fkey";

alter table "public"."chats" drop constraint "chats_reference_id_key";

drop index if exists "public"."chats_reference_id_key";

drop index if exists "public"."ix_chats_account_id";

alter table "public"."chats" drop column "account_id";

alter table "public"."chats" drop column "reference_id";

alter table "public"."chats" add column "deleted_on" timestamp with time zone;

alter table "public"."chats" add column "image" text;

alter table "public"."chats" add column "updated_at" timestamp with time zone default now();

alter table "public"."chats" add column "user_id" uuid not null;

alter table "public"."chats" add column "visibility" boolean default true;

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


