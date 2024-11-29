-- alter type "public"."app_permissions" rename to "app_permissions__old_version_to_be_dropped";

-- create type "public"."app_permissions" as enum ('roles.manage', 'billing.manage', 'settings.manage', 'members.manage', 'invites.manage', 'tasks.write', 'tasks.delete', 'messages.write', 'messages.read', 'orders.write', 'orders.read', 'orders.manage', 'orders.delete', 'services.write', 'services.read', 'services.manage', 'services.delete', 'billing.write', 'billing.read', 'billing.delete');

-- alter table "public"."role_permissions" alter column permission type "public"."app_permissions" using permission::text::"public"."app_permissions";

-- drop type "public"."app_permissions__old_version_to_be_dropped";

DO $$
BEGIN
    -- Add 'services.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'services.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'services.write';
    END IF;

    -- Add 'services.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'services.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'services.read';
    END IF;

    -- Add 'services.manage' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'services.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'services.manage';
    END IF;

    -- Add 'services.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'services.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'services.delete';
    END IF;

    -- Add 'billing.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'billing.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'billing.write';
    END IF;

    -- Add 'billing.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'billing.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'billing.read';
    END IF;

    -- Add 'billing.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'billing.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'billing.delete';
    END IF;
END $$;

COMMIT;

INSERT INTO public.role_permissions (role, permission) 
VALUES
    -- Agency Owner Permissions
    ('agency_owner', 'services.write'),
    ('agency_owner', 'services.read'),
    ('agency_owner', 'services.manage'),
    ('agency_owner', 'services.delete'),
    ('agency_owner', 'billing.write'),
    ('agency_owner', 'billing.read'),
    ('agency_owner', 'billing.delete'),

    -- Agency Member Permissions
    ('agency_member', 'services.read'),
    ('agency_member', 'billing.read'),

    -- Agency Project Manager Permissions
    ('agency_project_manager', 'services.write'),
    ('agency_project_manager', 'services.read'),
    ('agency_project_manager', 'services.manage'),
    ('agency_project_manager', 'billing.write'),
    ('agency_project_manager', 'billing.read'),

    -- Client Owner Permissions
    ('client_owner', 'services.read'),
    ('client_owner', 'billing.read'),

    -- Client Member Permissions
    ('client_member', 'services.read'),
    ('client_member', 'billing.read');

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT organization_id 
  FROM public.accounts 
  WHERE id = user_id
  LIMIT 1;
$function$
;

create policy "Allow agency managers to create billing accounts"
on "public"."billing_accounts"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'billing.write'::app_permissions))));


create policy "Allow agency managers to delete billing accounts"
on "public"."billing_accounts"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'billing.delete'::app_permissions))));


create policy "Allow agency managers to modify billing accounts"
on "public"."billing_accounts"
as permissive
for update
to public
with check (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'billing.manage'::app_permissions))));


create policy "Allow agency managers to read billing accounts"
on "public"."billing_accounts"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'billing.read'::app_permissions))));


create policy "Allow agency managers to create billing services"
on "public"."billing_services"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'services.write'::app_permissions))));


create policy "Allow agency managers to delete billing services"
on "public"."billing_services"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'services.delete'::app_permissions))));


create policy "Allow agency managers to modify billing services"
on "public"."billing_services"
as permissive
for update
to public
with check (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'services.manage'::app_permissions))));


create policy "Allow authorized users to read billing services"
on "public"."billing_services"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
  WHERE ((auth.uid() IS NOT NULL) AND ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'services.read'::app_permissions)) OR (is_user_in_client_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'services.read'::app_permissions)))))));