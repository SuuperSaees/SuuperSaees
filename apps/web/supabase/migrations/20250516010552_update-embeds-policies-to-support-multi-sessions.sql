drop policy "embeds_select_for_all_users" on "public"."embeds";

drop function if exists "public"."create_order"(_order jsonb, _brief_responses jsonb[], _order_followers text[], _order_file_ids uuid[]);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_current_session()
 RETURNS TABLE(organization_id uuid, agency_id uuid, role text)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_session_id uuid := (SELECT (auth.jwt() ->> 'session_id')::uuid);
  v_user_id uuid := (SELECT auth.uid());
BEGIN
  RETURN QUERY 
  SELECT 
    us.organization_id,
    us.agency_id,
    COALESCE(am.account_role, '')::text
  FROM auth.user_sessions us
  LEFT JOIN public.accounts_memberships am
    ON us.organization_id = am.organization_id
    AND us.user_id = am.user_id
  WHERE us.user_id = v_user_id
    AND us.session_id = v_session_id;
END;
$function$
;

GRANT EXECUTE ON FUNCTION public.get_current_session() TO authenticated, service_role, anon;

create policy "embeds_select_for_all_users"
on "public"."embeds"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (has_permission_in_organizations(auth.uid(), 'embeds.read'::app_permissions) AND ((((sess.session).role = ANY (ARRAY['agency_owner'::text, 'agency_project_manager'::text, 'agency_member'::text])) AND (embeds.organization_id = (sess.session).organization_id)) OR (((sess.session).role = ANY (ARRAY['client_owner'::text, 'client_member'::text])) AND (((embeds.visibility = 'private'::visibility) AND (EXISTS ( SELECT 1
           FROM embed_accounts ea
          WHERE ((ea.embed_id = embeds.id) AND (ea.organization_id = (sess.session).organization_id))))) OR ((embeds.visibility <> 'private'::visibility) AND (embeds.organization_id = (sess.session).agency_id)))))))));




