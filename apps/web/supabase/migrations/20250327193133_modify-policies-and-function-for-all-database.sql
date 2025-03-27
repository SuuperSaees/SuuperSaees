-- accounts
DROP POLICY IF EXISTS create_org_account ON public.accounts;

CREATE POLICY "Enable insert for authenticated users only" 
ON public.accounts
FOR INSERT
TO authenticated
WITH CHECK (
  true
);

create policy create_org_account on public.organizations for insert to authenticated
with
  check (
    public.is_set ('enable_team_accounts')
  );

-- organizations

create policy select_org_account on public.organizations for select to authenticated
using (
  true
);

create policy update_org_account on public.organizations as permissive
for update
to authenticated
using (
  true
);

create policy delete_org_account on public.organizations for delete to authenticated
using (
  true
);

-- accounts_memberships

CREATE OR REPLACE FUNCTION public.is_account_owner(organization_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        EXISTS(
            SELECT
                1
            FROM
                public.organizations
            WHERE
                id = is_account_owner.organization_id
                AND owner_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_account_owner(uuid) TO authenticated, service_role;

drop function if exists public.has_permission cascade;

create
or replace function public.has_permission (
  user_id uuid,
  organization_id uuid,
  permission_name public.app_permissions
) returns boolean
set
  search_path = '' as $$
begin
    return exists(
        select
            1
        from
            public.accounts_memberships
	    join public.role_permissions on
		accounts_memberships.account_role =
		role_permissions.role
        where
            accounts_memberships.user_id = has_permission.user_id
            and accounts_memberships.organization_id = has_permission.organization_id
            and role_permissions.permission = has_permission.permission_name);

end;

$$ language plpgsql;

drop function if exists public.can_action_account_member cascade;

create
or replace function public.can_action_account_member (target_organization_id uuid, target_user_id uuid) returns boolean
set
  search_path = '' as $$
declare
    permission_granted boolean;
    target_user_hierarchy_level int;
    current_user_hierarchy_level int;
    is_account_owner boolean;
    target_user_role varchar(50);
begin
    if target_user_id = auth.uid() then
      raise exception 'You cannot update your own account membership with this function';
    end if;

    -- an account owner can action any member of the account
    if public.is_account_owner(target_organization_id) then
      return true;
    end if;

     -- check the target user is the primary owner of the account
    select
        exists (
            select
                1
            from
                public.organizations
            where
                id = target_organization_id
                and owner_id = target_user_id) into is_account_owner;

    if is_account_owner then
        raise exception 'The primary account owner cannot be actioned';
    end if;

    -- validate the auth user has the required permission on the account
    -- to manage members of the account
    select
 public.has_permission(auth.uid(), target_organization_id,
     'members.manage'::public.app_permissions) into
     permission_granted;

    -- if the user does not have the required permission, raise an exception
    if not permission_granted then
      raise exception 'You do not have permission to action a member from this account';
    end if;

    -- get the role of the target user
    select
        am.account_role,
        r.hierarchy_level
    from
        public.accounts_memberships as am
    join
        public.roles as r on am.account_role = r.name
    where
        am.organization_id = target_organization_id
        and am.user_id = target_user_id
    into target_user_role, target_user_hierarchy_level;

    -- get the hierarchy level of the current user
    select
        r.hierarchy_level into current_user_hierarchy_level
    from
        public.roles as r
    join
        public.accounts_memberships as am on r.name = am.account_role
    where
        am.organization_id = target_organization_id
        and am.user_id = auth.uid();

    if target_user_role is null then
      raise exception 'The target user does not have a role on the account';
    end if;

    if current_user_hierarchy_level is null then
      raise exception 'The current user does not have a role on the account';
    end if;

    -- check the current user has a higher role than the target user
    if current_user_hierarchy_level >= target_user_hierarchy_level then
      raise exception 'You do not have permission to action a member from this account';
    end if;

    return true;

end;

$$ language plpgsql;

DROP POLICY IF EXISTS accounts_memberships_delete ON public.accounts_memberships;

CREATE POLICY accounts_memberships_delete 
ON public.accounts_memberships 
FOR DELETE 
TO authenticated 
USING (
  (
    user_id = auth.uid()
  )
  OR public.can_action_account_member(organization_id, user_id)
);

drop function if exists public.has_role_on_account cascade;

create
or replace function public.has_role_on_account (
  organization_id uuid,
  account_role varchar(50) default null
) returns boolean language sql security definer
set
  search_path = '' as $$
    select
        exists(
            select
                1
            from
                public.accounts_memberships membership
            where
                membership.user_id = (select auth.uid())
                and membership.organization_id = has_role_on_account.organization_id
                and((membership.account_role = has_role_on_account.account_role
                    or has_role_on_account.account_role is null)));
$$;

grant
execute on function public.has_role_on_account (uuid, varchar) to authenticated;

drop function if exists public.is_team_member cascade;

create
or replace function public.is_team_member (organization_id uuid, user_id uuid) returns boolean language sql security definer
set
  search_path = '' as $$
    select
        exists(
            select
                1
            from
                public.accounts_memberships membership
            where
                public.has_role_on_account(organization_id)
                and membership.user_id = is_team_member.user_id
                and membership.organization_id = is_team_member.organization_id);
$$;

grant
execute on function public.is_team_member (uuid, uuid) to authenticated,
service_role;

DROP POLICY IF EXISTS accounts_memberships_read ON public.accounts_memberships;

CREATE POLICY accounts_memberships_read 
ON public.accounts_memberships 
FOR SELECT
TO authenticated 
USING (
  user_id = auth.uid()
  OR public.is_team_member(organization_id, user_id)
);

    
-- billing_accounts
    
-- billing_customers
    
-- billing_services

-- chats
    
-- credits_usage
    
-- embeds
    
-- invitations
    
-- messages
    
-- notifications
    
-- order_items

-- orders
    
-- orders_v2
    
-- subscription_items
    
-- subscriptions
    
-- timers
    