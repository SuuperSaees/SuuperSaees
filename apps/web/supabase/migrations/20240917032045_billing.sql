drop policy "subscription_items_read_self" on "public"."subscription_items";

drop policy "subscriptions_read_self" on "public"."subscriptions";

alter table "public"."subscriptions" drop constraint "subscriptions_account_id_fkey";

drop view if exists "public"."user_account_workspace";

drop index if exists "public"."ix_subscriptions_account_id";

alter table "public"."subscriptions" drop column "account_id";

alter table "public"."subscriptions" add column "propietary_organization_id" uuid not null;

CREATE INDEX ix_subscriptions_account_id ON public.subscriptions USING btree (propietary_organization_id);

alter table "public"."subscriptions" add constraint "subscriptions_propietary_organization_id_fkey" FOREIGN KEY (propietary_organization_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_propietary_organization_id_fkey";

create or replace view "public"."user_account_workspace" as  SELECT accounts.id,
    accounts.name,
    accounts.picture_url,
    ( SELECT subscriptions.status
           FROM subscriptions
          WHERE (subscriptions.propietary_organization_id = accounts.id)
         LIMIT 1) AS subscription_status
   FROM accounts
  WHERE ((accounts.primary_owner_user_id = ( SELECT auth.uid() AS uid)) AND (accounts.is_personal_account = true))
 LIMIT 1;


create policy "Enable insert for authenticated users only"
on "public"."subscriptions"
as permissive
for insert
to public
with check (true);


create policy "Enable update for users based on email"
on "public"."subscriptions"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "subscription_items_read_self"
on "public"."subscription_items"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM subscriptions
  WHERE ((subscriptions.id = subscription_items.subscription_id) AND ((subscriptions.propietary_organization_id = ( SELECT auth.uid() AS uid)) OR has_role_on_account(subscriptions.propietary_organization_id))))));


create policy "subscriptions_read_self"
on "public"."subscriptions"
as permissive
for select
to authenticated
using (((has_role_on_account(propietary_organization_id) AND is_set('enable_team_account_billing'::text)) OR ((propietary_organization_id = ( SELECT auth.uid() AS uid)) AND is_set('enable_account_billing'::text))));