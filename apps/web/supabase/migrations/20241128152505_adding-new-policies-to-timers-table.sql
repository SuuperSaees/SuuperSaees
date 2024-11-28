drop policy "Users can delete their own timers" on "public"."timers";

drop policy "Users can insert their own timers" on "public"."timers";

drop policy "Users can update their own timers" on "public"."timers";

drop policy "Users can view their own timers" on "public"."timers";

alter type "public"."app_permissions" rename to "app_permissions__old_version_to_be_dropped";

create type "public"."app_permissions" as enum ('roles.manage', 'billing.manage', 'settings.manage', 'members.manage', 'invites.manage', 'tasks.write', 'tasks.delete', 'messages.write', 'messages.read', 'orders.write', 'orders.read', 'orders.manage', 'orders.delete', 'timers.write', 'timers.delete', 'timers.update', 'timers.read');

alter table "public"."role_permissions" alter column permission type "public"."app_permissions" using permission::text::"public"."app_permissions";

drop type "public"."app_permissions__old_version_to_be_dropped";

set check_function_bodies = off;

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
using (((auth.uid() IS NOT NULL) AND (is_user_in_agency_organization(auth.uid(), get_user_organization_id(auth.uid())) AND has_permission(auth.uid(), get_user_organization_id(auth.uid()), 'timers.update'::app_permissions) AND (auth.uid() = user_id))));

