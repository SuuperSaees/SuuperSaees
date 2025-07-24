drop function if exists public.get_user_organization_id cascade;

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

grant
execute on function public.has_permission (uuid, uuid, public.app_permissions) to authenticated,
service_role;

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
  user_id = (select auth.uid())
  OR (select public.is_team_member(organization_id, user_id))
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
  -- Get the organization ID directly from the auth.sessions table
  SELECT organization_id INTO org_id
  FROM auth.user_sessions
  WHERE session_id = (auth.jwt() ->> 'session_id')::uuid
  AND user_id = target_user_id
  LIMIT 1;
  
  -- If no organization ID is found, return false
  IF org_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the user belongs to this organization and it's an agency organization
  IF is_user_in_agency_organization(target_user_id, org_id) THEN
    is_member := true;
  END IF;
  
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
  -- Get the current session information
  SELECT organization_id INTO org_id
  FROM auth.user_sessions
  WHERE session_id = ((select auth.jwt()) ->> 'session_id')::uuid
  AND user_id = target_user_id
  LIMIT 1;
  
  -- If no session data or no organization, return false
  IF org_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the user has the specified permission in this organization
  IF has_permission(target_user_id, org_id, permission_name) THEN
    has_perm := true;
  END IF;
  
  RETURN has_perm;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_permission_in_organizations(uuid, public.app_permissions) TO authenticated, service_role;

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
using (((auth.uid() IS NOT NULL) AND (user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'billing.manage'::app_permissions))));

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

GRANT EXECUTE ON FUNCTION public.user_belongs_to_client_organizations(uuid) TO authenticated, service_role;

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

alter table "public"."embeds" enable row level security;

drop policy if exists "embeds_delete_agency" on "public"."embeds";
drop policy if exists "embeds_insert_agency" on "public"."embeds";
drop policy if exists "embeds_select_for_all_users" on "public"."embeds";
drop policy if exists "embeds_update_agency" on "public"."embeds";

create policy "embeds_delete_agency"
on "public"."embeds"
as permissive
for delete
to authenticated
using ((is_user_in_agency_organization(auth.uid(), organization_id) AND has_permission(auth.uid(), organization_id, 'embeds.delete'::app_permissions)));


create policy "embeds_insert_agency"
on "public"."embeds"
as permissive
for insert
to authenticated
with check ((is_user_in_agency_organization(auth.uid(), organization_id) AND has_permission(auth.uid(), organization_id, 'embeds.write'::app_permissions)));

create policy "embeds_select_for_all_users"
on "public"."embeds"
as permissive
for select
to authenticated
using ((has_permission_in_organizations(auth.uid(), 'embeds.read'::app_permissions) AND ((EXISTS ( SELECT 1
   FROM clients c
  WHERE ((c.user_client_id = auth.uid()) AND ((organization_id = c.agency_id) OR (organization_id = c.organization_client_id)) AND ((visibility <> 'private'::visibility) OR (EXISTS ( SELECT 1
           FROM embed_accounts ea
          WHERE ((ea.embed_id = embeds.id) AND (ea.organization_id = c.organization_client_id)))))))) OR (is_user_in_agency_organization(auth.uid(), organization_id)))));

create policy "embeds_update_agency"
on "public"."embeds"
as permissive
for update
to authenticated
using ((is_user_in_agency_organization(auth.uid(), organization_id) AND has_permission(auth.uid(), organization_id, 'embeds.manage'::app_permissions)));
    
-- invitations

drop policy if exists "invitations_create_self" on "public"."invitations";
drop policy if exists "invitations_delete" on "public"."invitations";
drop policy if exists "invitations_update" on "public"."invitations";

create policy invitations_create_self
on "public"."invitations"
as permissive
for insert
to authenticated
with check ((is_set('enable_team_accounts'::text) AND has_permission(( SELECT auth.uid() AS uid), organization_id, 'invites.manage'::app_permissions) AND has_same_role_hierarchy_level_or_lower(( SELECT auth.uid() AS uid), organization_id, ((role)::text)::character varying)));

create policy invitations_delete on public.invitations for delete to authenticated using (
  has_role_on_account(organization_id)
  and public.has_permission (
    (
      select
        auth.uid ()
    ),
    organization_id,
    'invites.manage'::public.app_permissions
  )
);

create policy invitations_update on public.invitations
for update
  to authenticated using (
    public.has_permission (
      (
        select
          auth.uid ()
      ),
      organization_id,
      'invites.manage'::public.app_permissions
    )
    and public.has_more_elevated_role (
      (
        select
          auth.uid ()
      ),
      organization_id,
      role
    )
  )
with
  check (
    public.has_permission (
      (
        select
          auth.uid ()
      ),
      organization_id,
      'invites.manage'::public.app_permissions
    )
    and public.has_more_elevated_role (
      (
        select
          auth.uid ()
      ),
      organization_id,
      role
    )
  );
    
-- messages

drop function if exists public.get_agency_id_from_orders_v2 cascade;
drop function if exists public.get_client_organization_id_from_orders_v2 cascade;

create or replace function public.get_client_organization_id_from_orders_v2(target_user_id uuid, order_id bigint)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  client_org_id uuid;
begin
  -- Obtener el client_organization_id de la orden
  select client_organization_id into client_org_id 
  from orders_v2 
  where id = order_id;
  
  -- Verificar si existe una relación entre el usuario y la organización
  if exists (
    select 1 
    from accounts_memberships 
    where user_id = target_user_id 
    and organization_id = client_org_id
  ) then
    return client_org_id;
  else
    return null; -- Retorna NULL si no hay relación
  end if;
end;
$$;

create or replace function public.get_agency_id_from_orders_v2(target_user_id uuid, order_id bigint)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  agency_org_id uuid;
begin
  -- Obtener el agency_id de la orden
  select agency_id into agency_org_id 
  from orders_v2 
  where id = order_id;
  
  -- Verificar si existe una relación entre el usuario y la organización
  if exists (
    select 1 
    from accounts_memberships 
    where user_id = target_user_id 
    and organization_id = agency_org_id
  ) then
    return agency_org_id;
  else
    return null; -- Retorna NULL si no hay relación
  end if;
end;
$$;

grant execute on function public.get_agency_id_from_orders_v2(uuid, bigint) to authenticated, service_role;
grant execute on function public.get_client_organization_id_from_orders_v2(uuid, bigint) to authenticated, service_role;
        
-- orders_v2

drop policy if exists "Allow authorized users to create orders" on "public"."orders_v2";

create policy "Allow authorized users to create orders"
on "public"."orders_v2"
as permissive
for insert
to authenticated
with check ((((is_user_in_agency_organization(auth.uid(), agency_id) AND has_permission(auth.uid(), agency_id, 'orders.write'::app_permissions)) OR (is_user_in_client_organization(auth.uid(), client_organization_id) AND has_permission(auth.uid(), client_organization_id, 'orders.write'::app_permissions)))));
    
-- subscriptions

drop policy if exists "subscriptions_read_self" on "public"."subscriptions";
    
create policy "subscriptions_read_self"
on "public"."subscriptions"
as permissive
for select
to authenticated
using ((((propietary_organization_id = ( SELECT auth.uid() AS uid)) AND is_set('enable_account_billing'::text))));

-- timers

drop policy if exists "Allow users with specific permissions to create timers" on "public"."timers";
drop policy if exists "Allow users with specific permissions to delete timers" on "public"."timers";
drop policy if exists "Allow users with specific permissions to read orders" on "public"."timers";
drop policy if exists "Allow users with specific permissions to update orders" on "public"."timers";

create policy "Allow users with specific permissions to create timers"
on "public"."timers"
as permissive
for insert
to authenticated
with check (((user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'timers.write'::app_permissions))));


create policy "Allow users with specific permissions to delete timers"
on "public"."timers"
as permissive
for delete
to authenticated
using (((user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'timers.delete'::app_permissions) AND (auth.uid() = user_id))));


create policy "Allow users with specific permissions to read timers"
on "public"."timers"
as permissive
for select
to authenticated
using (
  has_permission_in_organizations(auth.uid(), 'timers.read'::app_permissions) AND
  (
    user_belongs_to_agency_organizations(auth.uid()) OR 
    user_belongs_to_client_organizations(auth.uid())
  )
);

create policy "Allow users with specific permissions to update orders"
on "public"."timers"
as permissive
for update
to authenticated
using (((user_belongs_to_agency_organizations(auth.uid()) AND has_permission_in_organizations(auth.uid(), 'timers.manage'::app_permissions) AND (auth.uid() = user_id))));

-- functions and triggers 
-- 1. insert_organization_subdomain

drop function if exists public.insert_organization_subdomain() cascade;
drop trigger if exists after_insert_subdomain on public.subdomains;

CREATE OR REPLACE FUNCTION public.insert_organization_subdomain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_organization_id uuid;
BEGIN
    SELECT organization_id INTO v_organization_id
    FROM public.accounts_memberships
    WHERE user_id = auth.uid();

    INSERT INTO public.organization_subdomains (organization_id, subdomain_id)
    VALUES (v_organization_id, NEW.id);

    RETURN NEW;
END;
$function$
;

CREATE TRIGGER after_insert_subdomain AFTER INSERT ON public.subdomains FOR EACH ROW EXECUTE FUNCTION insert_organization_subdomain();

GRANT EXECUTE ON FUNCTION public.insert_organization_subdomain() TO authenticated, service_role;

-- 2. delete_checkout_if_deleted_on_not_null it's not related for this migration

-- 3. handle_deleted_on it's not related for this migration

-- 4. update_updated_at it's not related for this migration

-- 30. handle_organization_settings_portal_name_changes it's not related for this migration

-- 27. deduct_credits it's not related for this migration

-- 5. handle_new_account_credits_usage

drop function if exists kit.handle_new_account_credits_usage() cascade;
drop trigger if exists on_account_created_fill_credits on public.accounts;

drop function if exists kit.handle_new_organization_credits_usage() cascade;
drop trigger if exists on_organization_created_fill_credits on public.organizations;

create or replace function kit.handle_new_organization_credits_usage()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  organizations_count integer;
begin
  -- collect the number of organizations the user owns
  select count(*) 
  from public.organizations
  where owner_id = new.owner_id
  into organizations_count;

  -- we add credits only when this is the 1st organization
  -- to avoid abuse of the free credits
  if organizations_count > 1 then
    insert into public.credits_usage (organization_id, remaining_credits)
      values (new.id, 0);

    return new;
  end if;

  -- since this is the first organization, we add 20000 credits
  insert into public.credits_usage (organization_id, remaining_credits)
  values (new.id, 20000);
  return new;
end;
$$;

create trigger on_organization_created_fill_credits
  after insert on public.organizations
  for each row
  execute procedure kit.handle_new_organization_credits_usage();

GRANT EXECUTE ON FUNCTION kit.handle_new_organization_credits_usage() TO authenticated, service_role;

-- 6. decrement_service_client_count it's not related for this migration

-- 7. increment_service_client_count it's not related for this migration

-- 16. insert_default_agency_statuses it's not related for this migration

-- 22. is_user_in_agency_organization it's not related for this migration

-- 23. is_user_in_client_organization it's not related for this migration

-- 12. update_notification_dismissed_status it's not related for this migration

-- 21. get_user_organization_id it's not related for this migration

-- 24. has_permission it's not related for this migration

-- 18. update_order it's not related for this migration

-- 25. mark_order_messages_as_read it's not related for this migration

-- 26. mark_chat_messages_as_read it's not related for this migration

-- 33. handle_subscription_update it's not related for this migration

-- 34. handle_subscription_delete it's not related for this migration

-- 35. handle_billing_item_update it's not related for this migration

-- 36. handle_billing_item_delete it's not related for this migration

-- 8. check_team_account

drop function if exists kit.check_team_account() cascade;
drop trigger if exists only_team_accounts_check on public.invitations;

create
or replace function kit.check_team_account () returns trigger
set
  search_path = '' as $$
begin
    -- Verify if the organization exists
    if not exists (
        select 1
        from
            public.organizations
        where
            id = new.organization_id
    ) then
        raise exception 'Organization does not exist';
    end if;

    return NEW;
end;

$$ language plpgsql;

create trigger only_team_accounts_check before insert
or
update on public.invitations for each row
execute procedure kit.check_team_account ();

GRANT EXECUTE ON FUNCTION kit.check_team_account() TO authenticated, service_role;

-- 9. prevent_account_owner_membership_delete

drop function if exists kit.prevent_account_owner_membership_delete() cascade;
drop trigger if exists prevent_account_owner_membership_delete_check on public.accounts_memberships;

create
or replace function kit.prevent_account_owner_membership_delete () returns trigger
set
  search_path = '' as $$
begin
    if exists(
        select
            1
        from
            public.organizations
        where
            id = old.organization_id
            and owner_id = old.user_id) then
    raise exception 'The primary account owner cannot be removed from the account membership list';

end if;

    return old;

end;

$$ language plpgsql;

create
or replace trigger prevent_account_owner_membership_delete_check before delete on public.accounts_memberships for each row
execute function kit.prevent_account_owner_membership_delete ();

GRANT EXECUTE ON FUNCTION kit.prevent_account_owner_membership_delete() TO authenticated, service_role;

-- 10. protect_account_fields

drop function if exists kit.protect_account_fields() cascade;
drop trigger if exists protect_account_fields on public.accounts;

create
or replace function kit.protect_account_fields () returns trigger as $$
begin
    if current_user in('authenticated', 'anon') then
	if new.id <> old.id then
            raise exception 'You do not have permission to update this field';
        end if;
    end if;

    return NEW;

end
$$ language plpgsql
set
  search_path = '';

-- trigger to protect account fields
create trigger protect_account_fields before
update on public.accounts for each row
execute function kit.protect_account_fields ();

GRANT EXECUTE ON FUNCTION kit.protect_account_fields() TO authenticated, service_role;

-- 11. set_slug_from_account_name (usado en dos triggers)

drop function if exists kit.set_slug_from_account_name() cascade;
drop trigger if exists set_slug_from_account_name on public.accounts;
drop trigger if exists update_slug_from_account_name on public.accounts;

create
or replace function kit.set_slug_from_account_name () returns trigger language plpgsql security definer
set
  search_path = '' as $$
declare
    sql_string varchar;
    tmp_slug varchar;
    increment integer;
    tmp_row record;
    tmp_row_count integer;
begin
    tmp_row_count = 1;

    increment = 0;

    while tmp_row_count > 0 loop
        if increment > 0 then
            tmp_slug = kit.slugify(new.name || ' ' || increment::varchar);

        else
            tmp_slug = kit.slugify(new.name);

        end if;

	sql_string = format('select count(1) cnt from public.organizations where slug = ''' || tmp_slug ||
	    '''; ');

        for tmp_row in execute (sql_string)
            loop
                raise notice 'tmp_row %', tmp_row;

                tmp_row_count = tmp_row.cnt;

            end loop;

        increment = increment +1;

    end loop;

    new.slug := tmp_slug;

    return NEW;

end
$$;


create trigger "set_slug_from_account_name" before insert on public.organizations for each row when (
  NEW.name is not null
  and NEW.slug is null
)
execute procedure kit.set_slug_from_account_name ();

-- Create a trigger when a name is updated to update the slug
create trigger "update_slug_from_account_name" before
update on public.organizations for each row when (
  NEW.name is not null
  and NEW.name <> OLD.name
)
execute procedure kit.set_slug_from_account_name ();


-- 15. add_current_user_to_new_account
drop function if exists kit.add_current_user_to_new_account() cascade;
drop function if exists public.get_session() cascade;
drop trigger if exists add_current_user_to_new_account on public.accounts;

-- delete the table if it exists
DROP TABLE IF EXISTS "auth"."user_sessions";

-- create the table
CREATE TABLE "auth"."user_sessions" (
  user_id uuid not null,
  session_id uuid not null,
  organization_id uuid,
  agency_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

grant all on table "auth"."user_sessions" to anon, authenticated, service_role;

alter table "auth"."user_sessions" add constraint "user_sessions_user_id_fkey" foreign key ("user_id") references "auth"."users"("id") on delete cascade;

alter table "auth"."user_sessions" add constraint "user_sessions_session_id_fkey" foreign key ("session_id") references "auth"."sessions"("id") on delete cascade;

alter table "auth"."user_sessions" add constraint "user_sessions_organization_id_fkey" foreign key ("organization_id") references "public"."organizations"("id") on delete cascade;

alter table "auth"."user_sessions" add constraint "user_sessions_agency_id_fkey" foreign key ("agency_id") references "public"."organizations"("id") on delete cascade;

DROP FUNCTION IF EXISTS auth.handle_session_insert() CASCADE;

create or replace function auth.handle_session_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid;
  v_user_id uuid;
begin
  -- Use directly the values of the newly inserted row
  v_session_id := NEW.id;
  v_user_id := NEW.user_id;

  -- Insert the session into the user_sessions table, organization_id and agency_id are not available in the newly inserted row
  insert into auth.user_sessions (user_id, session_id, organization_id, agency_id)
  values (v_user_id, v_session_id, NULL, NULL);

  return NEW;
end;
$$;

grant execute on function auth.handle_session_insert() to anon, authenticated, service_role;

drop trigger if exists on_session_insert on auth.sessions;

create trigger on_session_insert 
after insert on auth.sessions
for each row
execute function auth.handle_session_insert();

create
or replace function kit.add_current_user_to_new_organization () returns trigger language plpgsql security definer
set
  search_path = '' as $$
begin
    if new.owner_id = auth.uid() then
        insert into public.accounts_memberships(
            organization_id,
            user_id,
            account_role)
        values(
            new.id,
            auth.uid(),
            public.get_upper_system_role());

        update auth.user_sessions
        set organization_id = new.id
        where user_id = auth.uid() and session_id = (auth.jwt() ->> 'session_id')::uuid;
    end if;

    return NEW;

end;

$$;

-- trigger the function whenever a new organization is created
create trigger "add_current_user_to_new_organization"
after insert on public.organizations for each row
execute function kit.add_current_user_to_new_organization ();

-- First, modify the organization_info type to make fields nullable
DROP TYPE IF EXISTS public.organization_info CASCADE;
CREATE TYPE public.organization_info AS (
    session_id text,
    id text,
    owner_id text,
    slug varchar,
    name varchar,
    role varchar,
    domain varchar
);

-- Then modify the session_info type to make agency nullable
DROP TYPE IF EXISTS public.session_info CASCADE;
CREATE TYPE public.session_info AS (
    session_id text,
    agency public.organization_info,
    organization public.organization_info
);

-- Now update the get_session function
CREATE OR REPLACE FUNCTION public.get_session()
RETURNS public.session_info
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_session_id uuid;
    v_org_id uuid;
    v_agency_id uuid;
    v_user_id uuid;
    v_user_settings_exists boolean;
    v_null_settings_exists boolean;
    org_result public.organization_info;
    agency_result public.organization_info;
    session_result public.session_info;
BEGIN
    -- Get the session_id from the current JWT
    v_session_id := (auth.jwt() ->> 'session_id')::uuid;
    v_user_id := auth.uid();
    
    -- Get the organization_id and agency_id from the current session
    SELECT organization_id, agency_id INTO v_org_id, v_agency_id
    FROM auth.user_sessions 
    WHERE user_id = v_user_id AND session_id = v_session_id;
    
    -- If there is no organization associated, return null
    IF v_org_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Check if there's a user_settings entry for this user and organization
    SELECT EXISTS(
        SELECT 1
        FROM public.user_settings
        WHERE user_id = v_user_id AND organization_id = v_org_id
    ) INTO v_user_settings_exists;
    
    -- If no entry exists for this specific organization
    IF NOT v_user_settings_exists THEN
        -- Check if there's an entry with NULL organization_id
        SELECT EXISTS(
            SELECT 1
            FROM public.user_settings
            WHERE user_id = v_user_id AND organization_id IS NULL
            LIMIT 1
        ) INTO v_null_settings_exists;
        
        IF v_null_settings_exists THEN
            -- Update the first NULL entry found
            UPDATE public.user_settings
            SET organization_id = v_org_id
            WHERE ctid IN (
                SELECT ctid
                FROM public.user_settings
                WHERE user_id = v_user_id AND organization_id IS NULL
                LIMIT 1
            );
        ELSE
            -- No entry exists at all, create a new one
            INSERT INTO public.user_settings(user_id, organization_id)
            VALUES (v_user_id, v_org_id);
        END IF;
    END IF;

    -- Query to get the organization data
    SELECT 
        v_session_id::text,
        o.id::text,
        o.owner_id::text,
        o.slug,
        o.name,
        am.account_role,
        COALESCE(s.domain, '')
    INTO org_result
    FROM 
        public.organizations o
    LEFT JOIN 
        public.accounts_memberships am ON am.organization_id = o.id AND am.user_id = v_user_id
    LEFT JOIN 
        public.organization_subdomains os ON os.organization_id = o.id
    LEFT JOIN 
        public.subdomains s ON s.id = os.subdomain_id
    WHERE 
        o.id = v_org_id
    LIMIT 1;
    
    -- If agency_id is NOT NULL, this is a client user and we need to get agency info
    IF v_agency_id IS NOT NULL THEN
        -- Get agency information
        SELECT 
            v_session_id::text,
            o.id::text,
            o.owner_id::text,
            o.slug,
            o.name,
            NULL, -- No role for agency since user is not a direct member
            COALESCE(s.domain, '')
        INTO agency_result
        FROM 
            public.organizations o
        LEFT JOIN 
            public.organization_subdomains os ON os.organization_id = o.id
        LEFT JOIN 
            public.subdomains s ON s.id = os.subdomain_id
        WHERE 
            o.id = v_agency_id
        LIMIT 1;
    ELSE
        -- If agency_id is NULL, this is an agency user
        -- agency_result remains NULL
        agency_result := NULL;
    END IF;
    
    -- Construct the final result
    session_result := ROW(
        v_session_id::text,
        agency_result,
        org_result
    )::public.session_info;
    
    RETURN session_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_session() TO authenticated, service_role, anon;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _org_id uuid, _role_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.accounts_memberships
    WHERE public.accounts_memberships.user_id = _user_id
      AND public.accounts_memberships.organization_id = _org_id
      AND public.accounts_memberships.account_role = _role_name
  );
END;
$function$
;

GRANT EXECUTE ON FUNCTION has_role(UUID, UUID, TEXT) TO authenticated, service_role;


CREATE OR REPLACE FUNCTION public.get_current_organization_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session_id uuid;
    v_user_id uuid;
    v_org_id uuid;
BEGIN
    -- Get the current user and session
    v_session_id := ((select auth.jwt()) ->> 'session_id')::uuid;
    v_user_id := (select auth.uid());
    
    -- Get only the organization_id from the current session
    SELECT organization_id INTO v_org_id
    FROM auth.user_sessions 
    WHERE user_id = v_user_id AND session_id = v_session_id;
    
    -- Return the organization_id (will be NULL if not found)
    RETURN v_org_id;
END;
$$;

-- Grant execute permission to authenticated users and service_role only
GRANT EXECUTE ON FUNCTION public.get_current_organization_id() TO authenticated, service_role;

-- Add comment to the function
COMMENT ON FUNCTION public.get_current_organization_id() IS 'Returns the organization_id for the current user session';

drop policy if exists "Read for all authenticated users" on "public"."messages";

create policy "Read for all authenticated users"
on "public"."messages"
as permissive
for select
to authenticated
using (
  has_permission_in_organizations((select auth.uid()), 'messages.read'::app_permissions) AND 
  (
    (
      (order_id IS NOT NULL) AND 
      (
        EXISTS (
          SELECT 1 
          FROM orders_v2 o 
          WHERE o.id = messages.order_id
          AND (
            (
              o.agency_id = (SELECT get_current_organization_id()) AND
              (
                (has_role((select auth.uid()), o.agency_id, 'agency_member') AND 
                 EXISTS (SELECT 1 FROM order_assignations oa WHERE oa.order_id = o.id AND oa.agency_member_id = (select auth.uid()))) OR
                has_role((select auth.uid()), o.agency_id, 'agency_owner') OR
                has_role((select auth.uid()), o.agency_id, 'agency_project_manager')
              )
            ) OR
            (
              o.client_organization_id = (SELECT get_current_organization_id()) AND
              (
                (has_role((select auth.uid()), o.client_organization_id, 'client_member') AND 
                 EXISTS (SELECT 1 FROM order_followers ofollow WHERE ofollow.order_id = o.id AND ofollow.client_member_id = (select auth.uid()))) OR
                has_role((select auth.uid()), o.client_organization_id, 'client_owner')
              )
            )
          )
        )
      )
    ) OR 
    (
      (chat_id IS NOT NULL) AND 
      (EXISTS (SELECT 1 FROM chat_members cm WHERE (cm.chat_id = messages.chat_id) AND (cm.user_id = (select auth.uid()))))
    )
  ) AND 
  (
    (visibility = 'public'::messages_types) OR 
    (
      (visibility = 'internal_agency'::messages_types) AND 
      (EXISTS (SELECT 1 FROM accounts a JOIN accounts_memberships am ON (am.organization_id = (SELECT get_current_organization_id())) 
               WHERE (a.id = messages.user_id) AND (am.user_id = (select auth.uid())) AND 
               ((am.account_role)::text = ANY (ARRAY['agency_owner'::text, 'agency_project_manager'::text, 'agency_member'::text]))))
    )
  )
);

CREATE OR REPLACE FUNCTION public.set_session(domain text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_session_id uuid;
    v_subdomain_id uuid;
    v_organization_id uuid;
    v_agency_id uuid;
    v_client_organization_id uuid;
    v_user_id uuid;
BEGIN
    -- Get the session_id from the current JWT and user_id
    v_session_id := (auth.jwt() ->> 'session_id')::uuid;
    v_user_id := auth.uid();
    
    -- Verify that the domain is not empty
    IF domain IS NULL OR domain = '' THEN
        RAISE EXCEPTION 'Domain cannot be empty';
    END IF;
    
    -- Find the subdomain by the provided domain
    SELECT id INTO v_subdomain_id
    FROM public.subdomains s
    WHERE s.domain = set_session.domain
    LIMIT 1;
    
    -- Verify if the subdomain was found
    IF v_subdomain_id IS NULL THEN
        RAISE EXCEPTION 'No subdomain found with domain: %', domain;
    END IF;
    
    -- Find the organization_id associated with the subdomain
    SELECT organization_id INTO v_organization_id
    FROM public.organization_subdomains
    WHERE subdomain_id = v_subdomain_id
    LIMIT 1;
    
    -- Verify if the organization was found
    IF v_organization_id IS NULL THEN
        RAISE EXCEPTION 'No organization found associated with domain: %', domain;
    END IF;
    
    -- Check if the user is a direct member of this organization (agency case)
    IF EXISTS (
        SELECT 1
        FROM public.accounts_memberships
        WHERE user_id = v_user_id
        AND organization_id = v_organization_id
    ) THEN
        -- User is a direct member of this organization (agency case)
        -- Set organization_id to the found organization and agency_id to NULL
        UPDATE auth.user_sessions
        SET 
            organization_id = v_organization_id,
            agency_id = NULL
        WHERE session_id = v_session_id
        AND user_id = v_user_id;
    ELSE
        -- User is not a direct member, check if this is a client organization
        -- Look for a client relationship where this organization is the agency
        SELECT organization_client_id INTO v_client_organization_id
        FROM public.clients
        WHERE agency_id = v_organization_id
        AND user_client_id = v_user_id
        LIMIT 1;

        IF v_client_organization_id IS NOT NULL THEN
            -- Set organization_id to the client organization and agency_id to the found organization
            UPDATE auth.user_sessions
            SET 
                organization_id = v_client_organization_id,
                agency_id = v_organization_id
            WHERE session_id = v_session_id
            AND user_id = v_user_id;
        ELSE
            -- Check if the user is a super-admin
            IF EXISTS (
                SELECT 1
                FROM auth.users
                WHERE id = v_user_id
                AND raw_app_meta_data->>'role' = 'super-admin'
            ) THEN
                -- Find an agency membership for the super-admin
                SELECT organization_id INTO v_organization_id
                FROM public.accounts_memberships
                WHERE user_id = v_user_id
                AND account_role IN ('agency_owner', 'agency_project_manager')
                LIMIT 1;
                
                -- If a membership is found, update the session
                IF v_organization_id IS NOT NULL THEN
                    UPDATE auth.user_sessions
                    SET 
                        organization_id = v_organization_id,
                        agency_id = NULL
                    WHERE session_id = v_session_id
                    AND user_id = v_user_id;
                END IF;
            ELSE
                RAISE EXCEPTION 'User does not belong to the organization or any of its clients associated with domain: %', domain;
            END IF;
        END IF;
    END IF;
    
    -- Verify if the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Could not update the current session';
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_session(text) TO authenticated, service_role;


-- 17. create_order

set check_function_bodies = off;

drop function if exists public.create_order(jsonb, jsonb[], text[], uuid[], uuid, uuid, text) cascade;

CREATE OR REPLACE FUNCTION public.create_order(
    _order jsonb,
    _brief_responses jsonb[],
    _order_followers text[],
    _order_file_ids uuid[],
    _organization_id uuid DEFAULT NULL,
    _user_id uuid DEFAULT NULL,
    _user_role text DEFAULT NULL
)
RETURNS orders_v2
LANGUAGE plpgsql
AS $function$DECLARE
  new_order public.orders_v2;  -- Declare new_order as a record of type orders_v2
  current_user_id uuid := COALESCE(_user_id, auth.uid());  -- Get the authenticated user's ID
  user_role text;  -- To store the current user's role
  subdomain_id uuid;  -- To store the subdomain ID
  org_id uuid;  -- To store the organization ID from subdomain
  client_data record;  -- To hold client data
  agency_organization_data record;  -- To hold agency organization data
  agency_client_id uuid;  -- To hold the agency client ID
  client_organization_id uuid;  -- To hold the client organization ID
  brief_ids uuid[];  -- Array to hold brief IDs
  agencyRoles text[] := ARRAY['agency_owner', 'agency_member', 'agency_project_manager'];  -- List of agency roles
  clientRoles text[] := ARRAY['client_owner', 'client_member'];  -- List of client roles
  all_followers text[];  -- Array to hold all followers
  default_status_id integer;  -- To hold the default status ID
  new_position integer;  -- To hold the new position
BEGIN
  -- Step 0: Verify the user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated';
  END IF;
  
  -- Step 0.1: Verify organization_id is not empty
  SELECT COALESCE(_organization_id, get_current_organization_id()) INTO org_id;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Organization not found for subdomain';
  END IF;
  
  -- Step 0.4: Get user role for this organization
  SELECT COALESCE(_user_role, am.account_role) INTO user_role
  FROM public.accounts_memberships am
  WHERE am.user_id = current_user_id
  AND am.organization_id = org_id
  LIMIT 1;
  
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'User does not have a role in this organization';
  END IF;

  -- Step 0.5: Check _order_followers and use its first value if it exists
  IF array_length(_order_followers, 1) IS NULL THEN
    _order_followers := ARRAY[current_user_id::text];  -- Default to current_user_id if _order_followers is empty
  END IF;

  -- Step 0.6: Get client data using the first value of _order_followers if present
  SELECT * INTO client_data
  FROM public.clients
  WHERE user_client_id = COALESCE(_order_followers[1]::uuid, current_user_id)
  LIMIT 1;

  -- Step 0.7: Determine agency_client_id and client_organization_id
  IF user_role = ANY(agencyRoles) THEN
    -- User is from agency
    agency_client_id := org_id;
    client_organization_id := COALESCE(client_data.organization_client_id, org_id);
  ELSE
    -- User is from client
    client_organization_id := org_id;
    
    -- Find the agency that this client belongs to
    SELECT agency_id INTO agency_client_id
    FROM public.clients
    WHERE organization_client_id = org_id
    LIMIT 1;
    
    IF agency_client_id IS NULL THEN
      -- If no agency found, use the client's organization
      agency_client_id := org_id;
    END IF;
  END IF;

  -- Step 0.8: Get agency organization data
  SELECT o.id, o.owner_id, o.name INTO agency_organization_data
  FROM public.organizations o
  WHERE o.id = agency_client_id
  LIMIT 1;

  -- Step 0.9: Get default status ID
  SELECT id INTO default_status_id
  FROM public.agency_statuses
  WHERE status_name = 'in_review'
  AND agency_id = agency_organization_data.id
  LIMIT 1;

  -- Step 0.10: If no status found, set default status_id to 1
  IF default_status_id IS NULL THEN
    default_status_id := 1;
  END IF;

  -- Step 0.11: Calculate the new position
  SELECT COALESCE(MAX(position), 0) + 1 INTO new_position
  FROM public.orders_v2
  WHERE status_id = default_status_id
  AND agency_id = agency_organization_data.id;

  -- Step 0.12: Prepare the order for insertion
  brief_ids := ARRAY(
    SELECT (response_item->>'brief_id')::uuid
    FROM unnest(_brief_responses) AS response_item
  );
  
  -- Construct the orderToInsert object
  _order := jsonb_set(_order, '{customer_id}', to_jsonb(COALESCE(_order_followers[1]::uuid, current_user_id::uuid)));
  _order := jsonb_set(_order, '{client_organization_id}', to_jsonb(client_organization_id::text));
  _order := jsonb_set(_order, '{propietary_organization_id}', to_jsonb(agency_organization_data.owner_id::text));
  _order := jsonb_set(_order, '{agency_id}', to_jsonb(agency_organization_data.id::text));
  _order := jsonb_set(_order, '{brief_ids}', to_jsonb(brief_ids));
  _order := jsonb_set(_order, '{position}', to_jsonb(new_position::int));

  -- Step 1: Insert the order into orders_v2
  INSERT INTO public.orders_v2 (
    agency_id,
    brief_ids,
    client_organization_id,
    created_at,
    customer_id,
    description,
    due_date,
    priority,
    propietary_organization_id,
    status,
    title,
    uuid,
    status_id,
    position,
    brief_id
  )
  VALUES (
    COALESCE(NULLIF(_order->>'agency_id', '')::uuid, NULL),
    COALESCE(
      ARRAY(
        SELECT elem::uuid
        FROM jsonb_array_elements_text(_order->'brief_ids') AS elem
      ),
      '{}'::uuid[]
    ),
    (_order->>'client_organization_id')::uuid,
    NOW(),
    (_order->>'customer_id')::uuid,
    _order->>'description',
    COALESCE(NULLIF(_order->>'due_date', ''), NULL)::timestamp with time zone,
    COALESCE(_order->>'priority', 'low')::priority_types,
    (_order->>'propietary_organization_id')::uuid,
    COALESCE(_order->>'status', 'in_review'),
    _order->>'title',
    _order->>'uuid',
    default_status_id,
    new_position,
    CASE 
      WHEN array_length(brief_ids, 1) > 0 THEN brief_ids[1]
      ELSE NULL
    END
  )
  RETURNING * INTO new_order;

  -- Step 2: Insert brief responses if present
  IF _brief_responses IS NOT NULL AND array_length(_brief_responses, 1) > 0 THEN
    INSERT INTO public.brief_responses (
      order_id,
      form_field_id,
      brief_id,
      response
    )
    SELECT
      new_order.uuid,
      (response_item->>'form_field_id')::uuid,
      (response_item->>'brief_id')::uuid,
      response_item->>'response'
    FROM unnest(_brief_responses) AS response_item;
  END IF;

  -- Step 3: Insert order files if present
  IF _order_file_ids IS NOT NULL AND array_length(_order_file_ids, 1) > 0 THEN
    INSERT INTO public.order_files (
      order_id,
      file_id
    )
    SELECT
      new_order.uuid,
      file_id
    FROM unnest(_order_file_ids) AS file_id;
  END IF;

  -- Step 4: Assign agency members to the order if role matches
  IF user_role = ANY (agencyRoles) THEN
    INSERT INTO public.order_assignations (
      agency_member_id,
      order_id
    )
    VALUES (
      current_user_id,
      new_order.id
    );
  END IF;

  -- Step 5: Determine initial follower based on client role and insert order followers
  IF user_role = ANY (clientRoles) THEN
    -- Only append _order_followers[1] if it is not already in the array
    all_followers := ARRAY(
      SELECT DISTINCT unnest(array_append(_order_followers, COALESCE(_order_followers[1]::text, current_user_id::text)))
    );
  ELSE
    all_followers := _order_followers;
  END IF;

  -- Step 6: Insert all followers if present
  IF array_length(all_followers, 1) > 0 THEN
    INSERT INTO public.order_followers (
      order_id,
      client_member_id
    )
    SELECT
      new_order.id,
      follower_id::uuid
    FROM unnest(all_followers) AS follower_id;
  END IF;

  -- Return the newly created order record
  RETURN new_order;
END;$function$
;

grant execute on function public.create_order(jsonb, jsonb[], text[], uuid[], uuid, uuid, text) to authenticated, service_role;
-- 20. get_account_members

DROP FUNCTION IF EXISTS public.get_account_members(text) CASCADE;

CREATE OR REPLACE FUNCTION public.get_account_members(organization_slug text)
 RETURNS TABLE(id uuid, user_id uuid, organization_id uuid, role character varying, role_hierarchy_level integer, owner_user_id uuid, name character varying, email character varying, picture_url character varying, created_at timestamp with time zone, updated_at timestamp with time zone, settings jsonb)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
    return QUERY
    select
        acc.id,
        am.user_id,
        am.organization_id,
        am.account_role,
        r.hierarchy_level,
        o.owner_id as owner_user_id,
        acc.name,
        acc.email,
        acc.picture_url,
        am.created_at,
        am.updated_at,
        jsonb_build_object(
        'name', us.name,
        'picture_url', us.picture_url
        ) AS settings
    from
        public.accounts_memberships am
        join public.organizations o on o.id = am.organization_id
        join public.accounts acc on acc.id = am.user_id
        join public.roles r on r.name = am.account_role
        left join public.user_settings us on us.user_id = am.user_id
    where
        o.slug = organization_slug
        and o.deleted_on is null
        and acc.deleted_on is null;
end;
$function$
;

grant execute on function public.get_account_members (text) to authenticated, service_role;

drop function if exists public.get_account_invitations(text) cascade;

create
or replace function public.get_account_invitations (organization_slug text) returns table (
  id integer,
  email varchar(255),
  organization_id uuid,
  invited_by uuid,
  role varchar(50),
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  inviter_name varchar,
  inviter_email varchar
)
set
  search_path = '' as $$
begin
    return query
    select
        invitation.id,
        invitation.email,
        invitation.organization_id,
        invitation.invited_by,
        invitation.role,
        invitation.created_at,
        invitation.updated_at,
        invitation.expires_at,
        inviter.name,
        inviter.email
    from
        public.invitations AS invitation
        JOIN public.organizations AS org ON invitation.organization_id = org.id
        JOIN public.accounts AS inviter ON invitation.invited_by = inviter.id

    where
        org.slug = organization_slug;

end;

$$ language plpgsql;

grant
execute on function public.get_account_invitations (text) to authenticated,
service_role;

-- setup_new_user 

drop function if exists kit.setup_new_user() cascade;
drop trigger if exists on_auth_user_created on auth.users;

create
or replace function kit.setup_new_user () returns trigger language plpgsql security definer
set
  search_path = '' as $$
declare
    user_name text;
begin
    if new.raw_user_meta_data ->> 'display_name' is not null then
        user_name := new.raw_user_meta_data ->> 'display_name';

    end if;

    if user_name is null and new.email is not null then
        user_name := split_part(new.email, '@', 1);

    end if;

    if user_name is null then
        user_name := '';
    end if;

    insert into public.accounts(
        id,
        name,
        email)
    values (
        new.id,
        user_name,
        new.email);

    return new;

end;

$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure kit.setup_new_user ();

grant execute on function kit.setup_new_user() to authenticated, service_role;

-- handle_update_user_email

drop function if exists kit.handle_update_user_email() cascade;
drop trigger if exists on_auth_user_updated on auth.users;

create
or replace function kit.handle_update_user_email () returns trigger language plpgsql security definer
set
  search_path = '' as $$
begin
    update
        public.accounts
    set
        email = new.email
    where
        id = new.id;
    return new;

end;

$$;

create trigger "on_auth_user_updated"
after
update of email on auth.users for each row
execute procedure kit.handle_update_user_email ();

grant execute on function kit.handle_update_user_email() to authenticated, service_role;

drop function if exists public.team_account_workspace(text) cascade;

CREATE OR REPLACE FUNCTION public.team_account_workspace(organization_slug text)
 RETURNS TABLE(id uuid, name text, picture_url text, slug text, role character varying, role_hierarchy_level integer, primary_owner_user_id uuid, subscription_status subscription_status, permissions app_permissions[])
 LANGUAGE plpgsql
AS $function$
begin
    return QUERY
    select
        org.id,
        org.name,
        org.picture_url,
        org.slug,
        accounts_memberships.account_role,
        roles.hierarchy_level,
        org.owner_id,
        subscriptions.status,
        array_agg(role_permissions.permission)
    from
        public.organizations as org
        join public.accounts_memberships on org.id = accounts_memberships.organization_id
        left join public.subscriptions on org.owner_id = subscriptions.propietary_organization_id
        join public.roles on accounts_memberships.account_role = roles.name
        left join public.role_permissions on accounts_memberships.account_role = role_permissions.role
    where
        org.slug = organization_slug
        and public.accounts_memberships.user_id = (select auth.uid())
    group by
        org.id,
        accounts_memberships.account_role,
        subscriptions.status,
        roles.hierarchy_level;
end;
$function$
;

grant execute on function public.team_account_workspace(text) to authenticated, service_role;

drop function if exists public.add_invitations_to_account(text, public.invitation[]) cascade;

create
or replace function public.add_invitations_to_organization (
  organization_slug text,
  invitations public.invitation[]
) returns public.invitations[]
set
  search_path = '' as $$
declare
    new_invitation public.invitations;
    all_invitations public.invitations[] := array[]::public.invitations[];
    invite_token text;
    email text;
    role varchar(50);
begin
    FOREACH email,
    role in array invitations loop
        invite_token := extensions.uuid_generate_v4();

        insert into public.invitations(
            email,
            organization_id,
            invited_by,
            role,
            invite_token)
        values (
            email,
(
                select
                    id
                from
                    public.organizations
                where
                    slug = organization_slug), auth.uid(), role, invite_token)
    returning
        * into new_invitation;

        all_invitations := array_append(all_invitations, new_invitation);

    end loop;

    return all_invitations;

end;

$$ language plpgsql;

grant
execute on function public.add_invitations_to_organization (text, public.invitation[]) to authenticated,
service_role;

drop function if exists public.has_same_role_hierarchy_level_or_lower(uuid, uuid, varchar) cascade;

create
or replace function public.has_same_role_hierarchy_level_or_lower (
  target_user_id uuid,
  target_organization_id uuid,
  role_name varchar
) returns boolean
set
  search_path = '' as $$
declare
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
                public.organizations
            where
                id = target_organization_id
                and owner_id = target_user_id) into is_primary_owner;

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
                organization_id = target_organization_id
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

   -- check the user's role hierarchy level is same or lower as the target role
    return user_role_hierarchy_level <= target_role_hierarchy_level;

end;

$$ language plpgsql;

grant
execute on function public.has_same_role_hierarchy_level_or_lower (uuid, uuid, varchar) to authenticated,
service_role;

DROP TABLE IF EXISTS "auth"."user_credentials";

-- create the table
CREATE TABLE "auth"."user_credentials" (
  email text not null,
  encrypted_password text not null,
  domain text not null, 
  is_primary boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

ALTER TABLE "auth"."user_credentials" 
ADD CONSTRAINT "user_credentials_domain_email_key" 
UNIQUE (domain, email);

grant all on table "auth"."user_credentials" to anon, authenticated, service_role;

-- Create a custom type for verify_user_credentials return value
CREATE TYPE public.verify_user_credentials_info AS (
    is_allowed BOOLEAN,
    is_primary BOOLEAN
);

-- RPC function to verify user credentials
CREATE OR REPLACE FUNCTION public.verify_user_credentials(
    p_domain TEXT,
    p_email TEXT,
    p_password TEXT
) RETURNS verify_user_credentials_info AS $$
DECLARE
    v_result verify_user_credentials_info;
    v_found BOOLEAN;
    v_is_allowed BOOLEAN := FALSE;
    v_is_primary BOOLEAN := FALSE;
    v_credentials RECORD;
BEGIN
    -- Search for the user credentials
    SELECT EXISTS (
        SELECT 1
        FROM auth.user_credentials
        WHERE domain = p_domain
        AND email = p_email
    ) INTO v_found;
    
    -- If no credentials are found, return negative result
    IF NOT v_found THEN
        -- Check if the user is a super-admin
        SELECT EXISTS (
            SELECT 1
            FROM auth.users
            WHERE email = p_email
            AND raw_app_meta_data->>'role' = 'super-admin'
        ) INTO v_found;
        
        IF v_found THEN
            -- Check if there is a primary credential with a valid password
            SELECT 
                is_primary,
                encrypted_password = crypt(p_password, encrypted_password) AS password_valid
            INTO v_credentials
            FROM auth.user_credentials
            WHERE email = p_email
            AND is_primary = TRUE;
            
            IF v_credentials.password_valid THEN
                v_result.is_allowed := TRUE;
                v_result.is_primary := TRUE;
                RETURN v_result;
            END IF;
        END IF;
        
        v_result.is_allowed := FALSE;
        v_result.is_primary := FALSE;
        RETURN v_result;
    END IF;
    
    -- Get the credentials and verify the password
    SELECT 
        is_primary,
        encrypted_password = crypt(p_password, encrypted_password) AS password_valid
    INTO v_credentials
    FROM auth.user_credentials
    WHERE domain = p_domain
    AND email = p_email;
    
    -- Build the result
    v_result.is_allowed := v_credentials.password_valid;
    v_result.is_primary := v_credentials.is_primary;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to execute the function from any schema
GRANT EXECUTE ON FUNCTION public.verify_user_credentials TO authenticated, anon, service_role;

-- Comment to document the function
COMMENT ON FUNCTION public.verify_user_credentials IS 
'Verify the user credentials based on domain, email and password. 
Returns a JSON object with is_valid (if the password is correct) and 
is_primary (if the account is primary).';

-- Function to create user credentials
create or replace function public.create_user_credentials(
  p_domain text,
  p_email text,
  p_password text
) returns void as $$
declare
  v_encrypted_password text;
  v_is_primary boolean;
begin
  -- Generate password hash
  v_encrypted_password := crypt(p_password, gen_salt('bf'));
  
  -- Determine if this should be a primary record
  -- It will be primary only if no primary record exists yet for this email
  select not exists(
    select 1 
    from auth.user_credentials 
    where email = p_email and is_primary = true
  ) into v_is_primary;
  
  -- Insert new credentials
  insert into auth.user_credentials (
    domain,
    email,
    encrypted_password,
    is_primary
  ) values (
    p_domain,
    p_email,
    v_encrypted_password,
    v_is_primary
  )
  -- In case of conflict, do nothing (to avoid duplicates)
  on conflict (domain, email) 
  do nothing;
  
end;
$$ language plpgsql security definer;

grant execute on function public.create_user_credentials to authenticated, service_role;

-- Function to update user credentials
create or replace function public.update_user_credentials(
  p_domain text,
  p_email text,
  p_password text
) returns void as $$
declare
  v_encrypted_password text;
  v_record_exists boolean;
begin
  -- Check if the record exists using exact matching
  select exists(
    select 1 
    from auth.user_credentials 
    where domain = p_domain and email = p_email
  ) into v_record_exists;
  
  -- If record exists, update it
  if v_record_exists then
    -- Start building the update statement
    update auth.user_credentials
    set updated_at = now()
    where domain = p_domain and email = p_email;
    
    -- Update password if provided and not empty
    if p_password is not null and p_password != '' then
      -- Generate hash for the new password
      v_encrypted_password := crypt(p_password, gen_salt('bf'));
      
      update auth.user_credentials
      set encrypted_password = v_encrypted_password
      where domain = p_domain and email = p_email;
    end if;
  end if;

  -- If record doesn't exist, check if there's a primary record for this email
  if not v_record_exists then
    select exists(
      select 1 
      from auth.user_credentials 
      where email = p_email and is_primary = true
    ) into v_record_exists;
    
    -- If primary record exists, update its domain
    if v_record_exists then
      update auth.user_credentials
      set domain = p_domain
      where email = p_email and is_primary = true;
    end if;
  end if;
  
end;
$$ language plpgsql security definer;

grant execute on function public.update_user_credentials to authenticated, service_role;

-- Function to handle insertions and updates in auth.users
CREATE OR REPLACE FUNCTION auth.handle_users_upsert()
RETURNS TRIGGER AS $$
BEGIN
    -- Verify if there is already a primary entry for this email
    IF EXISTS (
        SELECT 1 
        FROM auth.user_credentials 
        WHERE email = NEW.email 
        AND is_primary = TRUE
    ) THEN
        -- Update the encrypted password for the primary entry
        UPDATE auth.user_credentials
        SET encrypted_password = NEW.encrypted_password
        WHERE email = NEW.email
        AND is_primary = TRUE;
    ELSE
        -- Create a new primary entry with empty domain
        INSERT INTO auth.user_credentials (
            email,
            domain,
            is_primary,
            encrypted_password
        ) VALUES (
            NEW.email,
            '', -- Empty domain
            TRUE, -- Is primary
            NEW.encrypted_password
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

grant execute on function auth.handle_users_upsert to anon,authenticated, service_role;

-- Trigger for after insert in auth.users
CREATE OR REPLACE TRIGGER after_insert_users
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth.handle_users_upsert();

-- Trigger for after update in auth.users
CREATE OR REPLACE TRIGGER after_update_users
AFTER UPDATE OF encrypted_password ON auth.users
FOR EACH ROW
WHEN (NEW.encrypted_password IS DISTINCT FROM OLD.encrypted_password)
EXECUTE FUNCTION auth.handle_users_upsert();


-- Function to handle domain updates in subdomains
CREATE OR REPLACE FUNCTION auth.handle_subdomains_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If the domain has changed
    IF NEW.domain <> OLD.domain THEN
        -- Update all entries in user_credentials that use the old domain
        UPDATE auth.user_credentials
        SET domain = NEW.domain
        WHERE domain = OLD.domain;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for before update in subdomains
CREATE OR REPLACE TRIGGER before_update_subdomains
BEFORE UPDATE OF domain ON public.subdomains
FOR EACH ROW
WHEN (NEW.domain IS DISTINCT FROM OLD.domain)
EXECUTE FUNCTION auth.handle_subdomains_update();

-- Add an index to organization_id and user_id of user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_organization_id_user_id
ON public.user_settings (organization_id, user_id);

drop policy if exists "Policy with security definer functions" on "public"."user_settings";

create policy "Allow authenticated users to insert user_settings"
on "public"."user_settings"
as permissive
for insert
to authenticated
with check (true);

create policy "Allow authenticated users to delete user_settings"
on "public"."user_settings"
as permissive
for delete
to authenticated
using (true);

create policy "Allow authenticated users to update user_settings"
on "public"."user_settings"
as permissive
for update
to authenticated
using (
  -- If organization_id is NULL, allow update
  organization_id IS NULL OR
  (
    -- Get session info
    (get_session()).organization.id::uuid = organization_id OR
    (get_session()).agency.id::uuid = organization_id OR
    (
      -- Check client-agency relationship
      (get_session()).agency.id IS NOT NULL AND
      EXISTS (
        SELECT 1
        FROM public.clients
        WHERE agency_id = (get_session()).agency.id::uuid
        AND organization_client_id = organization_id
      )
    ) OR
    (
      -- Check agency-client relationship
      (get_session()).agency.id IS NULL AND
      EXISTS (
        SELECT 1
        FROM public.clients
        WHERE agency_id = (get_session()).organization.id::uuid
        AND organization_client_id = organization_id
      )
    )
  )
);

create policy "Allow authenticated users to select user_settings"
on "public"."user_settings"
as permissive
for select
to authenticated
using (
  -- No allow selection if organization_id is NULL
  organization_id IS NOT NULL AND
  (
    -- Get session info
    (get_session()).organization.id::uuid = organization_id OR
    (get_session()).agency.id::uuid = organization_id OR
    (
      -- Check client-agency relationship
      (get_session()).agency.id IS NOT NULL AND
      EXISTS (
        SELECT 1
        FROM public.clients
        WHERE agency_id = (get_session()).agency.id::uuid
        AND organization_client_id = organization_id
      )
    ) OR
    (
      -- Check agency-client relationship
      (get_session()).agency.id IS NULL AND
      EXISTS (
        SELECT 1
        FROM public.clients
        WHERE agency_id = (get_session()).organization.id::uuid
        AND organization_client_id = organization_id
      )
    )
  )
);

ALTER TABLE clients
ADD CONSTRAINT unique_client_constraint
UNIQUE (user_client_id, agency_id, organization_client_id);

ALTER TABLE accounts_memberships
ADD CONSTRAINT unique_accounts_memberships
UNIQUE (user_id, organization_id);