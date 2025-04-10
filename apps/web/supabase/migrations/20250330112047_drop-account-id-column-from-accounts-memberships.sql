alter table "public"."accounts_memberships" drop constraint "accounts_memberships_account_id_fkey1";

alter table "public"."accounts_memberships" drop constraint "accounts_memberships_pkey";

drop index if exists "public"."accounts_memberships_pkey";

drop index if exists "public"."ix_accounts_memberships_account_id";

alter table "public"."accounts_memberships" drop column "account_id" cascade;

alter table "public"."embed_accounts" drop column "account_id" cascade;

alter table "public"."credits_usage" drop column "account_id" cascade;

DROP VIEW IF EXISTS public.user_accounts;

CREATE OR REPLACE VIEW public.user_organization AS
WITH org_info AS (
  SELECT 
    (get_session()).organization.*
)
SELECT
  o.id::uuid AS id,
  oi.name,
  oi.slug,
  o.picture_url,
  oi.owner_id::uuid AS owner_id
FROM 
  org_info oi
JOIN
  public.organizations o ON o.id = oi.id::uuid
WHERE 
  oi.id IS NOT NULL;

GRANT SELECT ON public.user_organization TO authenticated, service_role;

DROP VIEW IF EXISTS public.user_account_workspace;

CREATE OR REPLACE VIEW public.user_account_workspace AS
WITH active_org AS (
  SELECT 
    (get_session()).organization.*
)
SELECT
  a.id AS id,
  a.name AS name,
  a.email AS email,
  -- Use COALESCE to select picture_url from user_settings first, then accounts
  COALESCE(us.picture_url, a.picture_url) AS picture_url,
  o.id AS organization_id,
  am.account_role AS role
FROM 
  public.accounts a
JOIN
  active_org ao ON TRUE
JOIN 
  public.organizations o ON o.id = ao.id::uuid
JOIN 
  public.accounts_memberships am ON am.organization_id = o.id AND am.user_id = a.id
LEFT JOIN 
  public.user_settings us ON us.user_id = a.id
WHERE 
  a.id = auth.uid()
  AND a.deleted_on IS NULL
  AND o.deleted_on IS NULL;

GRANT SELECT ON public.user_account_workspace TO authenticated, service_role;