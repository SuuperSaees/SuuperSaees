-- drop policy "accounts_read" on "public"."accounts";

-- DO $$
-- BEGIN
--     -- Add 'members.read' if not already present
--     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'members.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
--         ALTER TYPE public.app_permissions ADD VALUE 'members.read';
--     END IF;

--     -- Add 'members.write' if not already present
--     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'members.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
--         ALTER TYPE public.app_permissions ADD VALUE 'members.write';
--     END IF;

--     -- Add 'members.delete' if not already present
--     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'members.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
--         ALTER TYPE public.app_permissions ADD VALUE 'members.delete';
--     END IF;
-- END $$;

-- COMMIT;


-- INSERT INTO public.role_permissions (role, permission) 
-- VALUES
--     -- Assign 'members.read' permission to roles
--     ('agency_owner', 'members.read'),
--     ('agency_member', 'members.read'),
--     ('agency_project_manager', 'members.read'),
--     ('client_owner', 'members.read'),
--     ('client_member', 'members.read');

-- set check_function_bodies = off;

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
      AND public.accounts_memberships.account_id = _org_id
      AND public.accounts_memberships.account_role = _role_name
  );
END;
$function$
;

GRANT EXECUTE ON FUNCTION has_role(UUID, UUID, TEXT) TO authenticated, service_role;

-- create policy "organizations_read"
-- on "public"."accounts"
-- as permissive
-- for select
-- to authenticated
-- using (((auth.uid() IS NOT NULL) AND (NOT is_personal_account) AND ((is_user_in_agency_organization(auth.uid(), id) AND has_permission(auth.uid(), id, 'members.read'::app_permissions)) OR (is_user_in_client_organization(auth.uid(), id) AND has_permission(auth.uid(), id, 'members.read'::app_permissions)))));


-- create policy "user_read"
-- on "public"."accounts"
-- as permissive
-- for select
-- to authenticated
-- using (((auth.uid() IS NOT NULL) AND is_personal_account AND ((is_user_in_agency_organization(auth.uid(), organization_id) AND has_permission(auth.uid(), organization_id, 'members.read'::app_permissions) AND (has_role(auth.uid(), organization_id, 'agency_owner'::text) OR (has_role(auth.uid(), organization_id, 'agency_member'::text) AND (id = auth.uid())) OR has_role(auth.uid(), organization_id, 'agency_project_manager'::text))) OR (is_user_in_client_organization(auth.uid(), organization_id) AND has_permission(auth.uid(), organization_id, 'members.read'::app_permissions) AND (has_role(auth.uid(), organization_id, 'client_owner'::text) OR has_role(auth.uid(), organization_id, 'client_member'::text))))));

