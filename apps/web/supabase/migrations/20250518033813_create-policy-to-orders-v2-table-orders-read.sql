drop policy if exists "orders_read" on "public"."orders_v2";

create policy "orders_read"
on "public"."orders_v2"
as permissive
for select
to authenticated
using ((EXISTS (
         SELECT 1
         FROM (SELECT get_current_session() AS session) sess
         WHERE is_user_in_agency_organization(auth.uid(), agency_id) 
           AND has_permission(auth.uid(), agency_id, 'orders.read'::app_permissions)
           AND agency_id = (sess.session).organization_id
           AND (
             -- Agency owners and project managers can read all orders
             (sess.session).role IN ('agency_owner', 'agency_project_manager')
             OR 
             -- Agency members and others must be assigned to the order
             EXISTS (
               SELECT 1 
               FROM public.order_assignations oa 
               WHERE oa.order_id = orders_v2.id 
                 AND oa.agency_member_id = (SELECT auth.uid())
             )
           )
       )) OR 
       (EXISTS ( 
         SELECT 1
         FROM (SELECT get_current_session() AS session) sess
         WHERE is_user_in_client_organization(auth.uid(), client_organization_id) 
           AND has_permission(auth.uid(), client_organization_id, 'orders.read'::app_permissions)
           AND agency_id = (sess.session).agency_id
       )));
