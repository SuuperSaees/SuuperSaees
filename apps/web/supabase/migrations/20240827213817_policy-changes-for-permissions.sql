drop policy "Delete for all authenticated users" on "public"."messages";

drop policy "Read for all authenticated users" on "public"."messages";

alter type "public"."app_permissions" rename to "app_permissions__old_version_to_be_dropped";

create type "public"."app_permissions" as enum ('roles.manage', 'billing.manage', 'settings.manage', 'members.manage', 'invites.manage', 'tasks.write', 'tasks.delete', 'messages.write', 'messages.read');

alter table "public"."role_permissions" alter column permission type "public"."app_permissions" using permission::text::"public"."app_permissions";

drop type "public"."app_permissions__old_version_to_be_dropped";

create policy "Enable delete for users based on user_id"
on "public"."messages"
as permissive
for delete
to public
using (true);


create policy "Read order messages for related members"
on "public"."messages"
as permissive
for select
to authenticated
using (has_permission(auth.uid(), user_id, 'messages.read'::app_permissions));





