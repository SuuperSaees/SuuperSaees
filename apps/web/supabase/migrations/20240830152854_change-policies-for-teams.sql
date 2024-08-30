drop trigger if exists "accounts_teardown" on "public"."accounts";

drop trigger if exists "invitations_insert" on "public"."invitations";

drop trigger if exists "subscriptions_delete" on "public"."subscriptions";

drop policy "Enable delete for users based on user_id" on "public"."messages";

drop policy "Read order messages for related members" on "public"."messages";

drop policy "invitations_create_self" on "public"."invitations";

drop view if exists "public"."user_account_workspace";

drop view if exists "public"."user_accounts";

alter table "public"."accounts" drop column "stripe_id";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.has_same_role_hierarchy_level_or_lower(target_user_id uuid, target_account_id uuid, role_name text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$declare
    is_primary_owner boolean;
    user_role_hierarchy_level int;
    target_role_hierarchy_level int;
begin
    -- Check if the user is the primary owner of the account
    select
        exists (
            select
                1
            from
                public.accounts
            where
                id = target_account_id
                and primary_owner_user_id = target_user_id) into is_primary_owner;

    -- If the user is the primary owner, they have the highest role and can perform any action
    if is_primary_owner then
        return true;
    end if;

    -- Get the hierarchy level of the user's role within the account
    select
        hierarchy_level into user_role_hierarchy_level
    from
        public.roles
    where
        name =(
            select
                account_role
            from
                public.accounts_memberships
            where
                account_id = target_account_id
                and target_user_id = user_id);

    -- If the user does not have a role in the account, they cannot perform the action
    if user_role_hierarchy_level is null then
        return false;
    end if;

    -- Get the hierarchy level of the target role
    select
        hierarchy_level into target_role_hierarchy_level
    from
        public.roles
    where
        name = role_name;

    -- If the target role does not exist, the user cannot perform the action
    if target_role_hierarchy_level is null then
        return false;
    end if;

   -- check the user's role hierarchy level is the same as the target role
    return user_role_hierarchy_level <= target_role_hierarchy_level;

end;$function$
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


create policy "invitations_create_self"
on "public"."invitations"
as permissive
for insert
to authenticated
with check ((is_set('enable_team_accounts'::text) AND has_permission(( SELECT auth.uid() AS uid), account_id, 'invites.manage'::app_permissions) AND has_same_role_hierarchy_level(( SELECT auth.uid() AS uid), account_id, ((role)::text)::character varying)));



