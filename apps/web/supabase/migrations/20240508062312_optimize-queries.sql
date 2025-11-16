drop view if exists "public"."user_account_workspace";

CREATE OR REPLACE FUNCTION public.team_account_workspace(account_slug text)
 RETURNS TABLE(id uuid, name character varying, picture_url character varying, slug text, role character varying, role_hierarchy_level integer, primary_owner_user_id uuid, subscription_status subscription_status, permissions app_permissions[])
 LANGUAGE plpgsql
AS $function$
begin
    return QUERY
    select
        accounts.id,
        accounts.name,
        accounts.picture_url,
        accounts.slug,
        accounts_memberships.account_role,
        roles.hierarchy_level,
        accounts.primary_owner_user_id,
        subscriptions.status,
        array_agg(role_permissions.permission)
    from
        public.accounts
        join public.accounts_memberships on accounts.id = accounts_memberships.account_id
        left join public.subscriptions on accounts.id = subscriptions.account_id
        join public.roles on accounts_memberships.account_role = roles.name
        left join public.role_permissions on accounts_memberships.account_role = role_permissions.role
    where
        accounts.slug = account_slug
        and public.accounts_memberships.user_id = (select auth.uid())
    group by
        accounts.id,
        accounts_memberships.account_role,
        subscriptions.status,
        roles.hierarchy_level;
end;
$function$
;

create or replace view "public"."user_account_workspace" as  SELECT accounts.id,
    accounts.name,
    accounts.picture_url,
    ( SELECT subscriptions.status
           FROM subscriptions
          WHERE (subscriptions.account_id = accounts.id)
         LIMIT 1) AS subscription_status
   FROM accounts
  WHERE ((accounts.primary_owner_user_id = ( SELECT auth.uid() AS uid)) AND (accounts.is_personal_account = true))
 LIMIT 1;


create or replace view "public"."user_accounts" as  SELECT account.id,
    account.name,
    account.picture_url,
    account.slug,
    membership.account_role AS role
   FROM (accounts account
     JOIN accounts_memberships membership ON ((account.id = membership.account_id)))
  WHERE ((membership.user_id = ( SELECT auth.uid() AS uid)) AND (account.is_personal_account = false) AND (account.id IN ( SELECT accounts_memberships.account_id
           FROM accounts_memberships
          WHERE (accounts_memberships.user_id = ( SELECT auth.uid() AS uid)))));
