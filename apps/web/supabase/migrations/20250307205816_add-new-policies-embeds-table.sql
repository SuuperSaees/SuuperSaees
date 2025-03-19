alter table "public"."embed_accounts" drop constraint "embed_accounts_pkey";

drop index if exists "public"."embed_accounts_pkey";

-- alter type "public"."app_permissions" rename to "app_permissions__old_version_to_be_dropped";

-- create type "public"."app_permissions" as enum ('roles.manage', 'billing.manage', 'settings.manage', 'members.manage', 'invites.manage', 'tasks.write', 'tasks.delete', 'messages.write', 'messages.read', 'orders.write', 'orders.read', 'orders.manage', 'orders.delete', 'services.write', 'services.read', 'services.manage', 'services.delete', 'billing.write', 'billing.read', 'billing.delete', 'timers.write', 'timers.read', 'timers.manage', 'timers.delete', 'embeds.write', 'embeds.read', 'embeds.manage', 'embeds.delete');

-- alter table "public"."role_permissions" alter column permission type "public"."app_permissions" using permission::text::"public"."app_permissions";

-- drop type "public"."app_permissions__old_version_to_be_dropped" cascade;

DO $$
BEGIN
    -- Add 'embeds.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'embeds.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'embeds.write';
    END IF;

    -- Add 'embeds.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'embeds.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'embeds.read';
    END IF;

    -- Add 'embeds.manage' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'embeds.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'embeds.manage';
    END IF;

    -- Add 'embeds.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'embeds.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'embeds.delete';
    END IF;
END $$;
COMMIT;

alter table "public"."embeds" alter column "organization_id" drop not null;

alter table "public"."embeds" alter column "user_id" drop not null;

create policy "embed_accounts_delete_agency"
on "public"."embed_accounts"
as permissive
for delete
to authenticated
using (true);


create policy "embed_accounts_insert_agency"
on "public"."embed_accounts"
as permissive
for insert
to authenticated
with check (true);


create policy "embed_accounts_select_all"
on "public"."embed_accounts"
as permissive
for select
to authenticated
using (true);


create policy "embed_accounts_update_agency"
on "public"."embed_accounts"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "embeds_delete_agency"
on "public"."embeds"
as permissive
for delete
to authenticated
using ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'embeds.delete'::app_permissions) AND (organization_id = get_user_organization_id(auth.uid()))));


create policy "embeds_insert_agency"
on "public"."embeds"
as permissive
for insert
to authenticated
with check ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'embeds.write'::app_permissions) AND (organization_id = get_user_organization_id(auth.uid()))));


create policy "embeds_select_for_all_users"
on "public"."embeds"
as permissive
for select
to authenticated
using ((has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'embeds.read'::app_permissions) AND ((EXISTS ( SELECT 1
   FROM clients c
  WHERE ((c.user_client_id = auth.uid()) AND ((embeds.organization_id = c.agency_id) OR (embeds.organization_id = c.organization_client_id)) AND ((embeds.visibility <> 'private'::visibility) OR (EXISTS ( SELECT 1
           FROM embed_accounts ea
          WHERE ((ea.embed_id = embeds.id) AND (ea.account_id = c.organization_client_id)))))))) OR (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND (organization_id = get_user_organization_id(auth.uid()))))));


create policy "embeds_update_agency"
on "public"."embeds"
as permissive
for update
to authenticated
using ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'embeds.manage'::app_permissions) AND (organization_id = get_user_organization_id(auth.uid()))))
with check ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'embeds.manage'::app_permissions) AND (organization_id = get_user_organization_id(auth.uid()))));

INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'embeds.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'embeds.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'embeds.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'embeds.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'embeds.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'embeds.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'embeds.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'embeds.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'embeds.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'embeds.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'embeds.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'embeds.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'embeds.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'embeds.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'embeds.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'embeds.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'embeds.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_member', 'embeds.read');

