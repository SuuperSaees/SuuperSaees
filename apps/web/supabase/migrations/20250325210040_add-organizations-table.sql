create table "public"."organizations" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_on" timestamp with time zone,
    "name" text,
    "owner_id" uuid,
    "slug" text,
    "picture_url" text,
    "public_data" json
);


alter table "public"."organizations" enable row level security;

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."clients" add constraint "clients_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_agency_id_fkey";

alter table "public"."clients" add constraint "clients_organization_client_id_fkey" FOREIGN KEY (organization_client_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_organization_client_id_fkey";

alter table "public"."organizations" add constraint "organizations_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."organizations" validate constraint "organizations_owner_id_fkey";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

drop trigger if exists "prevent_memberships_update_check" on "public"."accounts_memberships";

ALTER TABLE "public"."accounts" DISABLE TRIGGER "after_update_accounts";

drop trigger if exists "after_update_accounts" on "public"."accounts";

ALTER TABLE "public"."organization_settings" DISABLE TRIGGER "after_update_organization_settings";

drop trigger if exists "after_update_organization_settings" on "public"."organization_settings";

alter table "public"."accounts_memberships" drop constraint "accounts_memberships_account_id_fkey";

alter table "public"."agency_statuses" drop constraint "agency_statuses_agency_id_fkey";

alter table "public"."chats" drop constraint "chats_agency_id_fkey";

alter table "public"."chats" drop constraint "chats_client_organization_id_fkey";

alter table "public"."client_services" drop constraint "client_services_agency_id_fkey";

alter table "public"."client_services" drop constraint "client_services_client_organization_id_fkey";

alter table "public"."clients" drop constraint "clients_agency_id_fkey";

alter table "public"."clients" drop constraint "clients_organization_client_id_fkey";

alter table "public"."embeds" drop constraint "embeds_organization_id_fkey";

alter table "public"."invitations" drop constraint "invitations_account_id_fkey";

alter table "public"."orders_v2" drop constraint "orders_v2_client_organization_id_fkey";

alter table "public"."organization_settings" drop constraint "organization_settings_account_id_fkey";

alter table "public"."organization_subdomains" drop constraint "organization_subdomains_organization_id_fkey";

alter table "public"."tags" drop constraint "tags_organization_id_fkey";

alter table "public"."invitations" drop constraint "invitations_email_account_id_key";

drop index if exists "public"."invitations_email_account_id_key";

drop index if exists "public"."ix_invitations_account_id";

alter table "public"."accounts_memberships" add column "organization_id" uuid not null;

alter table "public"."folder_files" alter column "agency_id" set data type uuid using "agency_id"::uuid;

alter table "public"."folder_files" alter column "client_organization_id" set data type uuid using "client_organization_id"::uuid;

alter table "public"."folders" alter column "agency_id" set data type uuid using "agency_id"::uuid;

alter table "public"."folders" alter column "client_organization_id" set data type uuid using "client_organization_id"::uuid;

alter table "public"."invitations" drop column "account_id" cascade;

alter table "public"."invitations" add column "organization_id" uuid not null;

alter table "public"."order_tags" alter column "order_id" set not null;

alter table "public"."organization_settings" drop column "account_id";

alter table "public"."organization_settings" add column "organization_id" uuid not null;

alter table "public"."services" alter column "propietary_organization_id" set data type uuid using "propietary_organization_id"::uuid;

CREATE INDEX idx_accounts_memberships_organization_id ON public.accounts_memberships USING btree (organization_id);

CREATE UNIQUE INDEX invitations_email_account_id_key ON public.invitations USING btree (email, organization_id);

CREATE INDEX ix_invitations_account_id ON public.invitations USING btree (organization_id);

alter table "public"."accounts" add constraint "accounts_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."accounts" validate constraint "accounts_organization_id_fkey";

alter table "public"."accounts_memberships" add constraint "accounts_memberships_account_id_fkey1" FOREIGN KEY (account_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."accounts_memberships" validate constraint "accounts_memberships_account_id_fkey1";

alter table "public"."accounts_memberships" add constraint "accounts_memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."accounts_memberships" validate constraint "accounts_memberships_organization_id_fkey";

alter table "public"."agency_statuses" add constraint "agency_statuses_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."agency_statuses" validate constraint "agency_statuses_agency_id_fkey1";

alter table "public"."chats" add constraint "chats_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."chats" validate constraint "chats_agency_id_fkey1";

alter table "public"."chats" add constraint "chats_client_organization_id_fkey1" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."chats" validate constraint "chats_client_organization_id_fkey1";

alter table "public"."client_services" add constraint "client_services_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."client_services" validate constraint "client_services_agency_id_fkey1";

alter table "public"."client_services" add constraint "client_services_client_organization_id_fkey1" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."client_services" validate constraint "client_services_client_organization_id_fkey1";

alter table "public"."clients" add constraint "clients_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."clients" validate constraint "clients_agency_id_fkey1";

alter table "public"."clients" add constraint "clients_organization_client_id_fkey1" FOREIGN KEY (organization_client_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."clients" validate constraint "clients_organization_client_id_fkey1";

alter table "public"."clients" add constraint "clients_user_client_id_fkey" FOREIGN KEY (user_client_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."clients" validate constraint "clients_user_client_id_fkey";

alter table "public"."embeds" add constraint "embeds_organization_id_fkey1" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."embeds" validate constraint "embeds_organization_id_fkey1";

alter table "public"."folder_files" add constraint "folder_files_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."folder_files" validate constraint "folder_files_agency_id_fkey";

alter table "public"."folder_files" add constraint "folder_files_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."folder_files" validate constraint "folder_files_client_organization_id_fkey";

alter table "public"."folders" add constraint "folders_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."folders" validate constraint "folders_agency_id_fkey";

alter table "public"."folders" add constraint "folders_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."folders" validate constraint "folders_client_organization_id_fkey";

alter table "public"."invitations" add constraint "invitations_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."invitations" validate constraint "invitations_organization_id_fkey";

alter table "public"."message_reads" add constraint "message_reads_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."message_reads" validate constraint "message_reads_chat_id_fkey";

alter table "public"."orders_v2" add constraint "orders_v2_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_agency_id_fkey";

alter table "public"."orders_v2" add constraint "orders_v2_client_organization_id_fkey1" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_client_organization_id_fkey1";

alter table "public"."organization_settings" add constraint "organization_settings_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."organization_settings" validate constraint "organization_settings_organization_id_fkey";

alter table "public"."organization_subdomains" add constraint "organization_subdomains_organization_id_fkey1" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."organization_subdomains" validate constraint "organization_subdomains_organization_id_fkey1";

alter table "public"."services" add constraint "services_propietary_organization_id_fkey" FOREIGN KEY (propietary_organization_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."services" validate constraint "services_propietary_organization_id_fkey";

alter table "public"."tags" add constraint "tags_organization_id_fkey1" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."tags" validate constraint "tags_organization_id_fkey1";

alter table "public"."invitations" add constraint "invitations_email_account_id_key" UNIQUE using index "invitations_email_account_id_key";

set check_function_bodies = off;

DROP TRIGGER IF EXISTS after_account_insert_default_agency_statuses ON public.accounts;

CREATE OR REPLACE FUNCTION public.insert_default_agency_statuses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insertar estados predeterminados para todas las organizaciones
    INSERT INTO agency_statuses (status_name, status_color, agency_id, position)
    VALUES 
        ('pending', '#fef7c3', NEW.id, 0),
        ('in_progress', '#f4ebff', NEW.id, 1),
        ('completed', '#dcfae6', NEW.id, 2),
        ('in_review', '#fef0c7', NEW.id, 3),
        ('anulled', '#fee4e2', NEW.id, 4);
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER after_organization_insert_default_agency_statuses 
AFTER INSERT ON public.organizations 
FOR EACH ROW 
EXECUTE FUNCTION public.insert_default_agency_statuses();

GRANT EXECUTE ON FUNCTION public.insert_default_agency_statuses() TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_default_agency_statuses() TO anon;
GRANT EXECUTE ON FUNCTION public.insert_default_agency_statuses() TO service_role;

-- Migration from accounts to organizations
-- This query migrates all non-personal accounts to the organizations table

BEGIN;

-- First, insert records from accounts (where is_personal_account = false) into organizations
INSERT INTO public.organizations (
  id,
  name,
  owner_id,
  slug,
  picture_url,
  public_data,
  deleted_on
)
SELECT 
  id,
  name,
  primary_owner_user_id AS owner_id,
  slug,
  picture_url,
  public_data,
  deleted_on
FROM 
  public.accounts
WHERE 
  is_personal_account = false
  AND deleted_on IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify that the migration was completed successfully
DO $$
DECLARE
  accounts_count INTEGER;
  orgs_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO accounts_count FROM public.accounts WHERE is_personal_account = false AND deleted_on IS NULL;
  SELECT COUNT(*) INTO orgs_count FROM public.organizations WHERE deleted_on IS NULL;
  
  RAISE NOTICE 'Migration completed: % non-personal accounts found, % organizations created', 
    accounts_count, orgs_count;
  
  IF accounts_count != orgs_count THEN
    RAISE WARNING 'The number of migrated accounts does not match the number of created organizations';
  END IF;
END $$;

COMMIT;

-- Migración para agregar organization_id a accounts_memberships
-- Esta migración mantiene account_id y agrega organization_id como referencia a organizations

BEGIN;

-- 1. Agregar la columna organization_id a accounts_memberships
ALTER TABLE public.accounts_memberships 
ADD COLUMN organization_id uuid;

-- 2. Actualizar la columna organization_id con los valores actuales de account_id
-- Esto asume que los IDs de accounts que representan organizaciones son los mismos que se usaron en la tabla organizations
UPDATE public.accounts_memberships
SET organization_id = account_id;

-- 3. Crear la restricción de clave foránea para organization_id que apunte a organizations
ALTER TABLE public.accounts_memberships
ADD CONSTRAINT accounts_memberships_organization_id_fkey
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 4. Crear un índice en organization_id para mejorar el rendimiento
CREATE INDEX idx_accounts_memberships_organization_id ON public.accounts_memberships(organization_id);

-- 5. Hacer que organization_id sea NOT NULL después de asegurarnos que todos los registros tienen un valor
ALTER TABLE public.accounts_memberships
ALTER COLUMN organization_id SET NOT NULL;

-- Verificar que la migración se haya realizado correctamente
DO $$
DECLARE
  count_memberships INTEGER;
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_memberships FROM public.accounts_memberships;
  SELECT COUNT(*) INTO null_count FROM public.accounts_memberships WHERE organization_id IS NULL;
  
  RAISE NOTICE 'Migration completed: % memberships updated, % with NULL organization_id', 
    count_memberships, null_count;
  
  IF null_count > 0 THEN
    RAISE WARNING 'There are % records with NULL organization_id', null_count;
  END IF;
END $$;

COMMIT;

ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "organization_id" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "stripe_id" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "slug" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "is_personal_account" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "primary_owner_user_id" CASCADE;

-- CREATE OR REPLACE FUNCTION public.create_team_account(name varchar)
-- RETURNS uuid
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- DECLARE
--   account_id uuid;
--   current_user_id uuid;
-- BEGIN
--   -- Obtener el ID del usuario actual
--   current_user_id := auth.uid();
  
--   -- Verificar que el ID del usuario no sea NULL
--   IF current_user_id IS NULL THEN
--     RAISE EXCEPTION 'User ID cannot be NULL';
--   END IF;

--   INSERT INTO organizations (name, slug, owner_id)
--   VALUES (
--     name,
--     kit.slugify(name),
--     current_user_id
--   )
--   RETURNING id INTO account_id;

--   INSERT INTO accounts_memberships (user_id, organization_id, account_role)
--   VALUES (current_user_id, account_id, 'agency_owner');

--   RETURN account_id;
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION public.create_personal_account()
-- RETURNS uuid
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- DECLARE
--   account_id uuid;
--   user_display_name text;
--   current_user_id uuid;
-- BEGIN
--   -- Obtener el ID del usuario actual
--   current_user_id := auth.uid();
  
--   -- Verificar que el ID del usuario no sea NULL
--   IF current_user_id IS NULL THEN
--     RAISE EXCEPTION 'User ID cannot be NULL';
--   END IF;

--   SELECT raw_user_meta_data->>'full_name'
--   INTO user_display_name
--   FROM auth.users
--   WHERE id = current_user_id;

--   INSERT INTO organizations (
--     name,
--     slug,
--     owner_id
--   )
--   VALUES (
--     COALESCE(user_display_name, 'Personal'),
--     kit.slugify(COALESCE(user_display_name, 'Personal') || '-' || SUBSTR(MD5(current_user_id::text), 0, 5)),
--     current_user_id
--   )
--   RETURNING id INTO account_id;

--   INSERT INTO accounts_memberships (user_id, organization_id, account_role)
--   VALUES (current_user_id, account_id, 'agency_owner');

--   RETURN account_id;
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION public.has_role_on_account(organization_id uuid)
-- RETURNS boolean
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1
--     FROM accounts_memberships
--     WHERE user_id = auth.uid()
--     AND organization_id = has_role_on_account.organization_id
--   );
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION public.get_role_for_user(organization_id uuid, user_id uuid DEFAULT NULL)
-- RETURNS varchar
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- DECLARE
--   role varchar;
-- BEGIN
--   SELECT account_role INTO role
--   FROM accounts_memberships
--   WHERE organization_id = get_role_for_user.organization_id
--   AND user_id = COALESCE(get_role_for_user.user_id, auth.uid());

--   RETURN role;
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION public.has_permission(organization_id uuid, permission app_permissions)
-- RETURNS boolean
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- DECLARE
--   user_role varchar;
-- BEGIN
--   SELECT account_role INTO user_role
--   FROM accounts_memberships
--   WHERE user_id = auth.uid()
--   AND organization_id = has_permission.organization_id;

--   RETURN EXISTS (
--     SELECT 1
--     FROM role_permissions
--     WHERE role = user_role
--     AND permissions @> ARRAY[permission]
--   );
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION kit.prevent_account_owner_membership_delete()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = ''
-- AS $$
-- DECLARE
--   is_owner boolean;
-- BEGIN
--   SELECT o.owner_id = OLD.user_id
--   INTO is_owner
--   FROM public.organizations o
--   WHERE o.id = OLD.organization_id;

--   IF is_owner THEN
--     RAISE EXCEPTION 'Cannot delete membership of primary owner';
--   END IF;

--   RETURN OLD;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS prevent_account_owner_membership_delete ON public.accounts_memberships;
-- CREATE TRIGGER prevent_account_owner_membership_delete
-- BEFORE DELETE ON public.accounts_memberships
-- FOR EACH ROW
-- EXECUTE FUNCTION kit.prevent_account_owner_membership_delete();

-- CREATE OR REPLACE FUNCTION kit.prevent_memberships_update()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = ''
-- AS $$
-- BEGIN
--   IF OLD.user_id <> NEW.user_id OR OLD.organization_id <> NEW.organization_id THEN
--     RAISE EXCEPTION 'Cannot update user_id or organization_id';
--   END IF;

--   RETURN NEW;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS prevent_memberships_update ON public.accounts_memberships;
-- CREATE TRIGGER prevent_memberships_update
-- BEFORE UPDATE ON public.accounts_memberships
-- FOR EACH ROW
-- EXECUTE FUNCTION kit.prevent_memberships_update();

-- CREATE OR REPLACE FUNCTION kit.check_team_account()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = ''
-- AS $$
-- DECLARE
--   is_team_account boolean;
-- BEGIN
--   SELECT NOT is_personal_account
--   INTO is_team_account
--   FROM public.organizations
--   WHERE id = NEW.organization_id;

--   IF NOT is_team_account THEN
--     RAISE EXCEPTION 'Cannot invite users to a personal account';
--   END IF;

--   RETURN NEW;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS check_team_account ON public.invitations;
-- CREATE TRIGGER check_team_account
-- BEFORE INSERT OR UPDATE ON public.invitations
-- FOR EACH ROW
-- EXECUTE FUNCTION kit.check_team_account();

-- CREATE OR REPLACE FUNCTION kit.setup_new_user()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = ''
-- AS $$
-- DECLARE
--   account_id uuid;
--   current_user_id uuid;
-- BEGIN
--   -- Asignar el ID del nuevo usuario
--   current_user_id := NEW.id;
  
--   -- Crear una cuenta personal para el usuario
--   SELECT public.create_personal_account() INTO account_id;

--   -- Insertar el usuario en la tabla accounts
--   INSERT INTO public.accounts (id, email, created_at, updated_at)
--   VALUES (current_user_id, NEW.email, NOW(), NOW());

--   RETURN NEW;
-- END;
-- $$;

-- CREATE OR REPLACE FUNCTION kit.single_account_per_owner()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = ''
-- AS $$
-- DECLARE
--   total_accounts int;
-- BEGIN
--   SELECT count(id)
--   FROM public.organizations
--   WHERE owner_id = auth.uid()
--   INTO total_accounts;

--   IF total_accounts > 0 THEN
--     RAISE EXCEPTION 'User can only own 1 account';
--   END IF;

--   RETURN NEW;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS single_account_per_owner ON public.organizations;
-- CREATE TRIGGER single_account_per_owner
-- BEFORE INSERT ON public.organizations
-- FOR EACH ROW
-- EXECUTE FUNCTION kit.single_account_per_owner();

-- CREATE OR REPLACE FUNCTION public.get_account_by_slug(slug text)
-- RETURNS public.organizations
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT *
--   FROM organizations
--   WHERE organizations.slug = get_account_by_slug.slug
--   LIMIT 1;
-- $$;

-- CREATE OR REPLACE FUNCTION public.get_accounts_for_authenticated_user()
-- RETURNS SETOF public.organizations
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT a.*
--   FROM organizations a
--   INNER JOIN accounts_memberships m ON m.organization_id = a.id
--   WHERE m.user_id = auth.uid();
-- $$;

-- CREATE OR REPLACE FUNCTION public.get_account_members(organization_id uuid)
-- RETURNS TABLE (
--   id uuid,
--   email text,
--   role varchar,
--   created_at timestamptz
-- )
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT
--     u.id,
--     u.email,
--     m.account_role as role,
--     m.created_at
--   FROM auth.users u
--   INNER JOIN accounts_memberships m ON m.user_id = u.id
--   WHERE m.organization_id = get_account_members.organization_id;
-- $$;

-- CREATE OR REPLACE FUNCTION public.get_account_invitations(organization_id uuid)
-- RETURNS SETOF public.invitations
-- LANGUAGE sql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
--   SELECT i.*
--   FROM invitations i
--   WHERE i.organization_id = get_account_invitations.organization_id;
-- $$;