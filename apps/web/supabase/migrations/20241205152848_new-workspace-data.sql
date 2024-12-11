drop view if exists "public"."user_account_workspace";
alter table "public"."subscriptions" alter column "account_id" set data type text using "account_id"::text;
alter table "public"."subscriptions" alter column "account_id" set data type uuid using "account_id"::uuid;

create or replace view "public"."user_account_workspace" as  SELECT accounts.id AS id,
    (COALESCE(user_settings.name, (accounts.name)::text))::character varying(255) AS name,
    (COALESCE(user_settings.picture_url, (accounts.picture_url)::text))::character varying(1000) AS picture_url,
    ( SELECT subscriptions.status
           FROM subscriptions
          WHERE (subscriptions.account_id = accounts.id)
         LIMIT 1) AS subscription_status,
    accounts_memberships.account_role AS role
   FROM ((accounts
     LEFT JOIN user_settings ON ((user_settings.user_id = accounts.id)))
     LEFT JOIN accounts_memberships ON ((accounts_memberships.user_id = accounts.id)))
  WHERE ((accounts.id = ( SELECT auth.uid() AS uid)) AND (accounts.is_personal_account = true))
 LIMIT 1;