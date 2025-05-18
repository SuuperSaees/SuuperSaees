drop policy if exists "orders_read" on "public"."orders_v2";

create policy "orders_read"
on "public"."orders_v2"
as permissive
for select
to authenticated
using (
  with session_data as (
    SELECT get_current_session() AS session
  )
  (EXISTS (
    SELECT 1
    FROM session_data
    WHERE is_user_in_agency_organization(auth.uid(), agency_id) 
      AND has_permission(auth.uid(), agency_id, 'orders.read'::app_permissions)
      AND agency_id = (session_data.session).organization_id
  )) OR 
  (EXISTS ( 
    SELECT 1
    FROM session_data
    WHERE is_user_in_client_organization(auth.uid(), client_organization_id) 
      AND has_permission(auth.uid(), client_organization_id, 'orders.read'::app_permissions)
      AND agency_id = (session_data.session).agency_id
  ))
);
