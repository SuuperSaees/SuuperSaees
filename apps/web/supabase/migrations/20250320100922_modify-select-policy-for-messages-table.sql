drop policy "Read for all authenticated users" on "public"."messages";

create policy "Read for all authenticated users"
on "public"."messages"
as permissive
for select
to authenticated
using ((has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'messages.read'::app_permissions) AND (((order_id IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM order_assignations oa
  WHERE (((oa.order_id)::text = (messages.order_id)::text) AND (oa.agency_member_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM order_followers ofollow
  WHERE (((ofollow.order_id)::text = (messages.order_id)::text) AND (ofollow.client_member_id = auth.uid())))) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_owner'::text) OR has_role(auth.uid(), get_user_organization_id(auth.uid()), 'agency_project_manager'::text)) AND ((is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND (EXISTS ( SELECT 1
   FROM orders_v2 o
  WHERE (((o.id)::text = (messages.order_id)::text) AND (o.agency_id = get_user_organization_id(auth.uid())))))) OR ((NOT is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid()))) AND (EXISTS ( SELECT 1
   FROM orders_v2 o
  WHERE (((o.id)::text = (messages.order_id)::text) AND (o.client_organization_id = get_user_organization_id(auth.uid())))))))) OR ((chat_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM chat_members cm
  WHERE ((cm.chat_id = messages.chat_id) AND (cm.user_id = auth.uid())))))) AND ((visibility = 'public'::messages_types) OR ((visibility = 'internal_agency'::messages_types) AND (EXISTS ( SELECT 1
   FROM (accounts a
     JOIN accounts_memberships am ON ((am.account_id = a.organization_id)))
  WHERE ((a.id = messages.user_id) AND (a.is_personal_account = true) AND (am.user_id = auth.uid()) AND ((am.account_role)::text = ANY (ARRAY['agency_owner'::text, 'agency_project_manager'::text, 'agency_member'::text])))))))));