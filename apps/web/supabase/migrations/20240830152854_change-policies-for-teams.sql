

drop policy "Enable delete for users based on user_id" on "public"."messages";

drop policy "Read order messages for related members" on "public"."messages";

drop policy "invitations_create_self" on "public"."invitations";
create
or replace function public.has_same_role_hierarchy_level_or_lower (
  target_user_id uuid,
  target_account_id uuid,
  role_name varchar
) returns boolean
set
  search_path = '' as $$
declare
    is_primary_owner boolean;
    user_role_hierarchy_level int;
    target_role_hierarchy_level int;
begin
    -- Check if the user is the primary owner of the account
    select
        exists (
            select
                1
            from
                public.accounts
            where
                id = target_account_id
                and primary_owner_user_id = target_user_id) into is_primary_owner;

    -- If the user is the primary owner, they have the highest role and can perform any action
    if is_primary_owner then
        return true;
    end if;

    -- Get the hierarchy level of the user's role within the account
    select
        hierarchy_level into user_role_hierarchy_level
    from
        public.roles
    where
        name =(
            select
                account_role
            from
                public.accounts_memberships
            where
                account_id = target_account_id
                and target_user_id = user_id);

    -- If the user does not have a role in the account, they cannot perform the action
    if user_role_hierarchy_level is null then
        return false;
    end if;

    -- Get the hierarchy level of the target role
    select
        hierarchy_level into target_role_hierarchy_level
    from
        public.roles
    where
        name = role_name;

    -- If the target role does not exist, the user cannot perform the action
    if target_role_hierarchy_level is null then
        return false;
    end if;

   -- check the user's role hierarchy level is same or lower as the target role
    return user_role_hierarchy_level <= target_role_hierarchy_level;

end;

$$ language plpgsql;

grant
execute on function public.has_same_role_hierarchy_level_or_lower (uuid, uuid, varchar) to authenticated,
service_role;

create policy "invitations_create_self"
on "public"."invitations"
as permissive
for insert
to authenticated
with check ((is_set('enable_team_accounts'::text) AND has_permission(( SELECT auth.uid() AS uid), account_id, 'invites.manage'::app_permissions) AND has_same_role_hierarchy_level(( SELECT auth.uid() AS uid), account_id, ((role)::text)::character varying)));