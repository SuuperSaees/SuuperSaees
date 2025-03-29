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
          WHERE ((ea.embed_id = embeds.id) AND (ea.account_id = c.organization_client_id)))))))) OR (is_user_in_agency_organization(auth.uid(), organization_id)))));

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

create policy "invitations_create_self"
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

drop policy if exists "Read for all authenticated users" on "public"."messages";

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

create policy "Read for all authenticated users"
on "public"."messages"
as permissive
for select
to authenticated
using ((has_permission_in_organizations(auth.uid(), 'messages.read'::app_permissions) AND


(((order_id IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM order_assignations oa
  WHERE (((oa.order_id)::text = (messages.order_id)::text) AND (oa.agency_member_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM order_followers ofollow
  WHERE (((ofollow.order_id)::text = (messages.order_id)::text) AND (ofollow.client_member_id = auth.uid())))) OR
  
  has_role(auth.uid(), get_agency_id_from_orders_v2(auth.uid(), order_id::integer), 'agency_owner'::text) OR has_role(auth.uid(), get_agency_id_from_orders_v2(auth.uid(), order_id::integer), 'agency_project_manager'::text))
  AND ((user_belongs_to_agency_organizations(auth.uid()) AND (EXISTS ( SELECT 1
   FROM orders_v2 o
  WHERE (((o.id)::text = (messages.order_id)::text) AND (o.agency_id = get_agency_id_from_orders_v2(auth.uid(), order_id::integer)))))) OR ((EXISTS ( SELECT 1
   FROM orders_v2 o
  WHERE (((o.id)::text = (messages.order_id)::text) AND (o.client_organization_id = get_client_organization_id_from_orders_v2(auth.uid(), order_id::integer))))))))

  OR ((chat_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM chat_members cm
  WHERE ((cm.chat_id = messages.chat_id) AND (cm.user_id = auth.uid())))))) AND ((visibility = 'public'::messages_types) OR ((visibility = 'internal_agency'::messages_types) AND (EXISTS ( SELECT 1
   FROM (accounts a
     JOIN accounts_memberships am ON ((am.user_id = auth.uid())))
  WHERE ((a.id = messages.user_id) AND (am.user_id = auth.uid()) AND ((am.account_role)::text = ANY (ARRAY['agency_owner'::text, 'agency_project_manager'::text, 'agency_member'::text])))))))));
        
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

drop function if exists public.insert_organization_subdomain();
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

drop function if exists kit.handle_new_account_credits_usage();
drop trigger if exists on_account_created_fill_credits on public.accounts;

drop function if exists kit.handle_new_organization_credits_usage();
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
    insert into public.credits_usage (account_id, remaining_credits)
      values (new.id, 0);

    return new;
  end if;

  -- since this is the first organization, we add 20000 credits
  insert into public.credits_usage (account_id, remaining_credits)
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

drop function if exists kit.check_team_account();
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

drop function if exists kit.prevent_account_owner_membership_delete();
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

drop function if exists kit.protect_account_fields();
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

drop function if exists kit.set_slug_from_account_name();
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
drop function if exists kit.add_current_user_to_new_account();
drop trigger if exists add_current_user_to_new_account on public.accounts;

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

    end if;

    return NEW;

end;

$$;

-- trigger the function whenever a new organization is created
create trigger "add_current_user_to_new_organization"
after insert on public.organizations for each row
execute function kit.add_current_user_to_new_organization ();

-- 17. create_order

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_order(_order jsonb, _brief_responses jsonb[], _order_followers text[], _order_file_ids uuid[])
 RETURNS orders_v2
 LANGUAGE plpgsql
AS $function$DECLARE
  new_order public.orders_v2;  -- Declare new_order as a record of type orders_v2
  current_user_id uuid := auth.uid();  -- Get the authenticated user's ID
  user_role text;  -- To store the current user's role
  account_data record;  -- To hold account data
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

  -- Step 0.1: Get the current user role
  SELECT am.account_role INTO user_role
  FROM public.accounts_memberships AS am  -- Use an alias for clarity
  WHERE am.user_id = current_user_id
  LIMIT 1;

  -- Step 0.2: Get account data
  SELECT * INTO account_data
  FROM public.accounts
  WHERE id = current_user_id
  LIMIT 1;

  -- Step 0.3.1: Check _order_followers and use its first value if it exists
  IF array_length(_order_followers, 1) IS NULL THEN
    _order_followers := ARRAY[current_user_id];  -- Default to current_user_id if _order_followers is empty
  END IF;

 -- Step 0.3.2: Get client data using the first value of _order_followers if present
  SELECT * INTO client_data
  FROM public.clients
  WHERE user_client_id = COALESCE(_order_followers[1]::uuid, current_user_id)  -- Use the first _order_followers value if it exists
  LIMIT 1;

  -- Step 0.4: Determine agencyClientId and clientOrganizationId
  agency_client_id := COALESCE(client_data.agency_id, account_data.organization_id);
  client_organization_id := COALESCE(client_data.organization_client_id, account_data.organization_id);

  -- Step 0.5: Get agency organization data
  SELECT id, primary_owner_user_id, name INTO agency_organization_data
  FROM public.accounts
  WHERE id = agency_client_id
  LIMIT 1;

  -- Step 0.6: Get default status ID
  SELECT id INTO default_status_id
  FROM public.agency_statuses
  WHERE status_name = 'in_review'
  AND agency_id = agency_organization_data.id
  LIMIT 1;

  -- Step 0.7: If no status found, set default status_id to 1
  IF default_status_id IS NULL THEN
    default_status_id := 1;
  END IF;

  -- Step 0.8: Calculate the new position
  SELECT COALESCE(MAX(position), 0) + 1 INTO new_position
  FROM public.orders_v2
  WHERE status_id = default_status_id  -- Use the default status_id determined earlier
  AND agency_id = agency_organization_data.id;  -- Filter by agency_id to ensure positions are scoped to the agency

  -- Step 0.9: Prepare the order for insertion (Include the calculated position)
  brief_ids := ARRAY(
    SELECT (response_item->>'brief_id')::uuid
    FROM unnest(_brief_responses) AS response_item
  );
  
 -- Construct the orderToInsert object
  _order := jsonb_set(_order, '{customer_id}', to_jsonb(COALESCE(_order_followers[1]::uuid, current_user_id::uuid)));
  _order := jsonb_set(_order, '{client_organization_id}', to_jsonb(client_organization_id::text));
  _order := jsonb_set(_order, '{propietary_organization_id}', to_jsonb(agency_organization_data.primary_owner_user_id::text));
  _order := jsonb_set(_order, '{agency_id}', to_jsonb(agency_organization_data.id::text));
  _order := jsonb_set(_order, '{brief_ids}', to_jsonb(brief_ids));
  _order := jsonb_set(_order, '{position}', to_jsonb(new_position::int));  -- Add the calculated position

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
    position,  -- Include the position in the INSERT statement
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
    new_position,  -- Use the calculated position
    CASE 
      WHEN array_length(brief_ids, 1) > 0 THEN brief_ids[1]  -- Tomar el primer elemento de brief_ids
      ELSE NULL
    END  -- Use the first brief_id if it exists, otherwise NULL
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
      current_user_id,  -- Use the authenticated user's ID
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
    all_followers := _order_followers;  -- Use provided followers if no client role
  END IF;

  -- Step 6: Insert all followers if present
  IF array_length(all_followers, 1) > 0 THEN
    INSERT INTO public.order_followers (
      order_id,
      client_member_id
    )
    SELECT
      new_order.id,
      follower_id::uuid  -- Convert each follower to uuid
    FROM unnest(all_followers) AS follower_id;
  END IF;

  -- Return the newly created order record
  RETURN new_order;
END;$function$
;

-- 20. get_account_members

DROP FUNCTION IF EXISTS public.get_account_members(text);

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
