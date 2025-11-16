alter type "public"."activity_type" rename to "activity_type__old_version_to_be_dropped";

create type "public"."activity_type" as enum ('message', 'review', 'status', 'priority', 'assign', 'due_date', 'description', 'title', 'assigned_to');

drop type "public"."activity_type__old_version_to_be_dropped";

alter table "public"."accounts_memberships" alter column "account_role" set default 'agency_owner'::character varying;

alter table "public"."activities" alter column "type" set data type activity_type using "type"::text::activity_type;

alter table "public"."activities" alter column "user_id" drop default;

alter table "public"."files" add column "user_id" uuid not null;

alter table "public"."reviews" alter column "rating" drop default;

alter table "public"."reviews" alter column "rating" drop not null;

alter table "public"."reviews" alter column "user_id" drop default;

alter table "public"."files" add constraint "files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."files" validate constraint "files_user_id_fkey";

create policy "Allow create user for all authenticated"
on "public"."accounts"
as permissive
for insert
to authenticated
with check (true);


