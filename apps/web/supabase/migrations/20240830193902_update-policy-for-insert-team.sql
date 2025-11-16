drop policy "invitations_create_self" on "public"."invitations";

create policy "invitations_create_self"
on "public"."invitations"
as permissive
for insert
to authenticated
with check ((is_set('enable_team_accounts'::text) AND has_permission(( SELECT auth.uid() AS uid), account_id, 'invites.manage'::app_permissions) AND has_same_role_hierarchy_level_or_lower(( SELECT auth.uid() AS uid), account_id, ((role)::text)::character varying)));