-- drop policy "create_org_account" on "public"."accounts";

-- drop policy "organizations_read" on "public"."accounts";

-- drop policy "user_read" on "public"."accounts";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_agency_client(_agency_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if the user is associated with the client in the clients table
  RETURN EXISTS (
    SELECT 1
    FROM clients
    WHERE agency_id = _agency_id
  );
END;
$function$
;

GRANT EXECUTE ON FUNCTION is_agency_client(UUID) TO authenticated, service_role;
-- create policy "create_org_account"
-- on "public"."accounts"
-- as permissive
-- for insert
-- to authenticated
-- with check (true);


-- create policy "organizations_read"
-- on "public"."accounts"
-- as permissive
-- for select
-- to authenticated
-- using (((auth.uid() IS NOT NULL) AND (is_personal_account = false) AND ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'members.read'::app_permissions) AND (has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_owner'::text) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_member'::text) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_project_manager'::text) OR (is_agency_client(id) AND is_user_in_client_organization(primary_owner_user_id, id)))) OR (is_user_in_client_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'members.read'::app_permissions) AND (has_role(auth.uid(), get_user_organization_id(auth.uid()), 'client_owner'::text) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'client_member'::text))))));


-- create policy "user_read"
-- on "public"."accounts"
-- as permissive
-- for select
-- to authenticated
-- using ((((auth.uid() IS NOT NULL) AND is_personal_account AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'members.read'::app_permissions) AND (has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_owner'::text) OR (has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_member'::text) AND (id = auth.uid())) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_project_manager'::text) OR (is_agency_client(organization_id) AND is_user_in_client_organization(id, organization_id))))) OR (is_user_in_client_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'members.read'::app_permissions) AND (has_role(auth.uid(), get_user_organization_id(auth.uid()), 'client_owner'::text) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'client_member'::text)))));




