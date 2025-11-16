drop view if exists "public"."user_account_workspace";
drop view if exists "public"."user_accounts";

create or replace view "public"."user_account_workspace" with (security_invoker = true)
as SELECT accounts.id,
    accounts.name,
    accounts.picture_url,
    ( SELECT subscriptions.status
           FROM subscriptions
          WHERE (subscriptions.account_id = accounts.id)
         LIMIT 1) AS subscription_status
   FROM accounts
  WHERE ((accounts.primary_owner_user_id = ( SELECT auth.uid() AS uid)) AND (accounts.is_personal_account = true))
 LIMIT 1;

create or replace view "public"."user_accounts" with (security_invoker = true) as SELECT account.id,
    account.name,
    account.picture_url,
    account.slug,
    membership.account_role AS role
   FROM (accounts account
     JOIN accounts_memberships membership ON ((account.id = membership.account_id)))
  WHERE ((membership.user_id = ( SELECT auth.uid() AS uid)) AND (account.is_personal_account = false) AND (account.id IN ( SELECT accounts_memberships.account_id
           FROM accounts_memberships
          WHERE (accounts_memberships.user_id = ( SELECT auth.uid() AS uid)))));