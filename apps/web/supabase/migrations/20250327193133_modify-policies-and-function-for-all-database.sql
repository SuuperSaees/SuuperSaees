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

drop function if exists public.is_account_owner cascade;

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

ALTER TABLE "public"."billing_accounts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow agency managers to create billing accounts" ON "public"."billing_accounts";
DROP POLICY IF EXISTS "Allow agency managers to delete billing accounts" ON "public"."billing_accounts";
DROP POLICY IF EXISTS "Allow agency managers to modify billing accounts" ON "public"."billing_accounts";
DROP POLICY IF EXISTS "Allow agency managers to read billing accounts" ON "public"."billing_accounts";

drop function if exists public.is_user_in_agency_organization cascade;

CREATE OR REPLACE FUNCTION public.is_user_in_agency_organization(user_id uuid, target_organization_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.accounts_memberships am
    WHERE am.user_id = is_user_in_agency_organization.user_id  -- Use the table alias to reference the table's column
      AND am.organization_id = target_organization_id
      AND am.account_role IN ('agency_owner', 'agency_project_manager', 'agency_member')
  );
END;$function$
;

grant
execute on function public.is_user_in_agency_organization (uuid, uuid) to authenticated,
service_role;

-- New function to get the organization id of the user

CREATE OR REPLACE FUNCTION public.user_belongs_to_agency_organizations(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  is_member boolean := false;
BEGIN
  FOR org_id IN 
    SELECT am.organization_id
    FROM accounts_memberships am
    WHERE am.user_id = target_user_id
    AND am.account_role IN ('agency_owner', 'agency_member', 'agency_project_manager')
  LOOP
    IF is_user_in_agency_organization(target_user_id, org_id) THEN
      is_member := true;
    END IF;
  END LOOP;
  
  RETURN is_member;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_belongs_to_agency_organizations(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_permission_in_organizations(
  target_user_id uuid,
  permission_name public.app_permissions
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  has_perm boolean := false;
BEGIN
  FOR org_id IN 
    SELECT am.organization_id
    FROM accounts_memberships am
    WHERE am.user_id = target_user_id
  LOOP
    IF has_permission(target_user_id, org_id, permission_name) THEN
      has_perm := true;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN has_perm;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_permission_in_organizations(uuid, app_permissions) TO authenticated, service_role;

create policy "Allow agency managers to create billing accounts"
on "public"."billing_accounts"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'billing.write'::app_permissions))));


create policy "Allow agency managers to delete billing accounts"
on "public"."billing_accounts"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'billing.delete'::app_permissions))));


create policy "Allow agency managers to modify billing accounts"
on "public"."billing_accounts"
as permissive
for update
to public
with check (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'billing.manage'::app_permissions))));


create policy "Allow agency managers to read billing accounts"
on "public"."billing_accounts"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'billing.read'::app_permissions))));
    
--  IMPORTANT: billing_customers It's not needed to fix because it's not used in the app
    
-- IMPORTANT: credits_usage It's not needed to fix because it's not used in the app

-- IMPORTANT: notifications It's not needed to fix because it's not used in the app
    
-- IMPORTANT: order_items It's not needed to fix because it's not used in the app

-- IMPORTANT: subscription_items It's not needed to fix because it's not used in the app

-- IMPORTANT: orders It's not needed to fix because it's not used in the app

-- IMPORTANT: chats It's not needed to fix because it's not orgaization related

-- billing_services

alter table "public"."billing_services" enable row level security;

drop policy if exists "Allow agency managers to create billing services" on "public"."billing_services";
drop policy if exists "Allow agency managers to delete billing services" on "public"."billing_services";
drop policy if exists "Allow agency managers to modify billing services" on "public"."billing_services";
drop policy if exists "Allow authorized users to read billing services" on "public"."billing_services";

drop function if exists public.is_user_in_client_organization cascade;

CREATE OR REPLACE FUNCTION public.is_user_in_client_organization(user_id uuid, target_organization_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$begin
  return exists (
    select 1
    from public.accounts_memberships am
    where am.user_id = is_user_in_client_organization.user_id
      and am.organization_id = target_organization_id
      and am.account_role in ('client_owner', 'client_member', 'client_guest')
  );
end;$function$
;

grant
execute on function public.is_user_in_client_organization (uuid, uuid) to authenticated,
service_role;

CREATE OR REPLACE FUNCTION public.user_belongs_to_client_organizations(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
  is_member boolean := false;
BEGIN
  FOR org_id IN 
    SELECT am.organization_id
    FROM accounts_memberships am
    WHERE am.user_id = target_user_id
    AND am.account_role IN ('client_owner', 'client_member', 'client_guest')
  LOOP
    IF is_user_in_client_organization(target_user_id, org_id) THEN
      is_member := true;
    END IF;
  END LOOP;
  
  RETURN is_member;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_belongs_to_agency_organizations(uuid) TO authenticated, service_role;

create policy "Allow agency managers to create billing services"
on "public"."billing_services"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'services.write'::app_permissions))));

create policy "Allow agency managers to delete billing services"
on "public"."billing_services"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'services.delete'::app_permissions))));

create policy "Allow agency managers to modify billing services"
on "public"."billing_services"
as permissive
for update
to public
with check (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'services.manage'::app_permissions))));

create policy "Allow authorized users to read billing services"
on "public"."billing_services"
as permissive
for select
to public
using (EXISTS (SELECT 1
  WHERE (auth.uid() IS NOT NULL) AND (has_permission_in_organizations(auth.uid(), 'services.read'::app_permissions)) AND (user_belongs_to_agency_organizations(auth.uid()) OR user_belongs_to_client_organizations(auth.uid()))));    
  
-- embeds
    
-- invitations
    
-- messages
        
-- orders_v2
    
-- subscriptions
    
-- timers
    