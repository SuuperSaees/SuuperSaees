alter table "public"."subscriptions" drop constraint "subscriptions_billing_customer_id_fkey";

drop view if exists "public"."user_account_workspace";

alter table "public"."subscriptions" alter column "billing_customer_id" set data type text using "billing_customer_id"::text;

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



