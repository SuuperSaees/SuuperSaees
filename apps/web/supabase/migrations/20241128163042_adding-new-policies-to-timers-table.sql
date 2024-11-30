DROP POLICY IF EXISTS "Users can delete their own timers" ON "public"."timers";

DROP POLICY IF EXISTS  "Users can insert their own timers" ON "public"."timers";

DROP POLICY IF EXISTS  "Users can update their own timers" ON "public"."timers";

DROP POLICY IF EXISTS  "Users can view their own timers" ON "public"."timers";

DO $$
BEGIN
    -- Add 'timers.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'timers.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'timers.write';
    END IF;

    -- Add 'timers.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'timers.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'timers.read';
    END IF;

    -- Add 'timers.manage' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'timers.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'timers.manage';
    END IF;

    -- Add 'timers.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'timers.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'timers.delete';
    END IF;
END $$;

COMMIT;

INSERT INTO public.role_permissions (role, permission)
VALUES
    -- Agency Owner Permissions
    ('agency_owner', 'timers.write'),
    ('agency_owner', 'timers.read'),
    ('agency_owner', 'timers.delete'),
    ('agency_owner', 'timers.manage'),
    -- Agency Member Permissions
    ('agency_member', 'timers.read'),
    ('agency_member', 'timers.delete'),
    ('agency_member', 'timers.manage'),
    ('agency_member', 'timers.write'),
    -- Agency Project Manager Permissions
    ('agency_project_manager', 'timers.write'),
    ('agency_project_manager', 'timers.read'),
    ('agency_project_manager', 'timers.delete'),
    ('agency_project_manager', 'timers.manage'),
    -- Client Owner Permissions
    ('client_owner', 'timers.read'),
    -- Client Member Permissions
    ('client_member', 'timers.read');


create policy "Policy with security definer functions"
on "public"."subtask_timers"
as permissive
for all
to authenticated
using (true);


create policy "Allow users with specific permissions to create timers"
on "public"."timers"
as permissive
for insert
to authenticated
with check (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'timers.write'::app_permissions))));


create policy "Allow users with specific permissions to delete timers"
on "public"."timers"
as permissive
for delete
to authenticated
using (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'timers.delete'::app_permissions) AND (auth.uid() = user_id))));


create policy "Allow users with specific permissions to read orders"
on "public"."timers"
as permissive
for select
to authenticated
using (((auth.uid() IS NOT NULL) AND ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'timers.read'::app_permissions)) OR (is_user_in_client_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'timers.read'::app_permissions)))));


create policy "Allow users with specific permissions to update orders"
on "public"."timers"
as permissive
for update
to authenticated
using (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'timers.manage'::app_permissions) AND (auth.uid() = user_id))));


grant execute on function public.get_user_organization_id(uuid) to authenticated;

grant execute on function public.get_user_organization_id(uuid) to service_role;