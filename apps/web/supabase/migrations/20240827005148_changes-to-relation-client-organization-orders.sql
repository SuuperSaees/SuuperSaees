drop policy "invitations_read_self" on "public"."invitations";

alter table "public"."orders_v2" add column "agency_id" uuid not null;

alter table "public"."orders_v2" add column "stripe_account_id" text;

create policy "invitations_read_self"
on "public"."invitations"
as permissive
for select
to authenticated
using (true);


