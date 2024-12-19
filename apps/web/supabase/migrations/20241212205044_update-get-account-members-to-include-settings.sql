DROP FUNCTION IF EXISTS public.get_account_members(text);

CREATE OR REPLACE FUNCTION public.get_account_members(account_slug text)
 RETURNS TABLE(id uuid, user_id uuid, account_id uuid, role character varying, role_hierarchy_level integer, primary_owner_user_id uuid, name character varying, email character varying, picture_url character varying, created_at timestamp with time zone, updated_at timestamp with time zone, settings jsonb)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
    return QUERY
    select
        acc.id,
        am.user_id,
        am.account_id,
        am.account_role,
        r.hierarchy_level,
        a.primary_owner_user_id,
        acc.name,
        acc.email,
        acc.picture_url,
        am.created_at,
        am.updated_at,
        jsonb_build_object(
        'name', us.name,
        'picture_url', us.picture_url
        ) AS settings
    from
        public.accounts_memberships am
        join public.accounts a on a.id = am.account_id
        join public.accounts acc on acc.id = am.user_id
        join public.roles r on r.name = am.account_role
        left join public.user_settings us on us.user_id = am.user_id -- Join with user_settings
    where
        a.slug = account_slug
        and a.deleted_on is null
        and acc.deleted_on is null;
end;
$function$
;

grant execute on function public.get_account_members (text) to authenticated, service_role;


