alter table "public"."chat_messages" disable row level security;

alter table "public"."account_plugins" add constraint "account_plugins_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account_plugins" validate constraint "account_plugins_account_id_fkey";

drop policy "Read for all authenticated users" on "public"."messages";

create policy "Read for all authenticated users"
on "public"."messages"
as permissive
for select
to authenticated
using (((visibility = 'public'::messages_types) OR ((visibility = 'internal_agency'::messages_types) AND (EXISTS ( SELECT 1
   FROM (accounts a
     JOIN accounts_memberships am ON ((am.account_id = a.organization_id)))
  WHERE ((a.id = messages.user_id) AND (a.is_personal_account = true) AND (am.user_id = auth.uid()) AND ((am.account_role)::text = ANY ((ARRAY['agency_owner'::character varying, 'agency_project_manager'::character varying, 'agency_member'::character varying])::text[]))))))));




