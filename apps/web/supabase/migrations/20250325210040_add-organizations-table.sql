create table if not exists "public"."organizations" (
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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'organizations_id_unique'
        AND table_name = 'organizations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.organizations
        ADD CONSTRAINT organizations_id_unique UNIQUE (id);
    END IF;
END $$;

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

alter table "public"."organizations" enable row level security;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'organizations_pkey'
        AND table_name = 'organizations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.organizations
        ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'organizations_owner_id_fkey'
        AND table_name = 'organizations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."organizations" 
        ADD CONSTRAINT "organizations_owner_id_fkey" 
        FOREIGN KEY (owner_id) REFERENCES accounts(id) 
        ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;
    END IF;
END $$;

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

-- ALTER TABLE "public"."accounts" DISABLE TRIGGER "after_update_accounts";

drop trigger if exists "after_update_accounts" on "public"."accounts";

-- ALTER TABLE "public"."organization_settings" DISABLE TRIGGER "after_update_organization_settings";

drop trigger if exists "after_update_organization_settings" on "public"."organization_settings";

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'accounts_memberships_account_id_fkey'
        AND table_name = 'accounts_memberships'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."accounts_memberships" 
        DROP CONSTRAINT "accounts_memberships_account_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'agency_statuses_agency_id_fkey'
        AND table_name = 'agency_statuses'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."agency_statuses" 
        DROP CONSTRAINT "agency_statuses_agency_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'chats_agency_id_fkey'
        AND table_name = 'chats'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."chats" 
        DROP CONSTRAINT "chats_agency_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'chats_client_organization_id_fkey'
        AND table_name = 'chats'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."chats" 
        DROP CONSTRAINT "chats_client_organization_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'client_services_agency_id_fkey'
        AND table_name = 'client_services'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."client_services" 
        DROP CONSTRAINT "client_services_agency_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'client_services_client_organization_id_fkey'
        AND table_name = 'client_services'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."client_services" 
        DROP CONSTRAINT "client_services_client_organization_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'clients_agency_id_fkey'
        AND table_name = 'clients'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."clients" 
        DROP CONSTRAINT "clients_agency_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'clients_organization_client_id_fkey'
        AND table_name = 'clients'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."clients" 
        DROP CONSTRAINT "clients_organization_client_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'embeds_organization_id_fkey'
        AND table_name = 'embeds'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."embeds" 
        DROP CONSTRAINT "embeds_organization_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'invitations_account_id_fkey'
        AND table_name = 'invitations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."invitations" 
        DROP CONSTRAINT "invitations_account_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'orders_v2_client_organization_id_fkey'
        AND table_name = 'orders_v2'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."orders_v2" 
        DROP CONSTRAINT "orders_v2_client_organization_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'organization_settings_account_id_fkey'
        AND table_name = 'organization_settings'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."organization_settings" 
        DROP CONSTRAINT "organization_settings_account_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'organization_subdomains_organization_id_fkey'
        AND table_name = 'organization_subdomains'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."organization_subdomains" 
        DROP CONSTRAINT "organization_subdomains_organization_id_fkey";
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'tags_organization_id_fkey'
        AND table_name = 'tags'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."tags" 
        DROP CONSTRAINT "tags_organization_id_fkey";
    END IF;
END $$;

alter table "public"."accounts_memberships" add column "organization_id" uuid;

alter table "public"."folder_files" alter column "agency_id" set data type uuid using "agency_id"::uuid;

alter table "public"."folder_files" alter column "client_organization_id" set data type uuid using "client_organization_id"::uuid;

alter table "public"."folders" alter column "agency_id" set data type uuid using "agency_id"::uuid;

alter table "public"."folders" alter column "client_organization_id" set data type uuid using "client_organization_id"::uuid;

alter table "public"."invitations" add column "organization_id" uuid;

alter table "public"."order_tags" alter column "order_id" set not null;

alter table "public"."organization_settings" add column "organization_id" uuid;

update public.organization_settings
set organization_id = account_id;

alter table public.organization_settings
alter column organization_id set not null;

alter table "public"."organization_settings" drop column "account_id";

alter table "public"."services" alter column "propietary_organization_id" set data type uuid using "propietary_organization_id"::uuid;

CREATE INDEX idx_accounts_memberships_organization_id ON public.accounts_memberships USING btree (organization_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'invitations_email_account_id_key'
        AND n.nspname = 'public'
    ) THEN
        CREATE UNIQUE INDEX invitations_email_account_id_key ON public.invitations USING btree (email, organization_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'ix_invitations_account_id'
        AND n.nspname = 'public'
    ) THEN
        CREATE INDEX ix_invitations_account_id ON public.invitations USING btree (organization_id);
    END IF;
END $$;

-- alter table "public"."accounts" add constraint "accounts_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

-- alter table "public"."accounts" validate constraint "accounts_organization_id_fkey";

-- alter table "public"."accounts_memberships" add constraint "accounts_memberships_account_id_fkey1" FOREIGN KEY (account_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

-- alter table "public"."accounts_memberships" validate constraint "accounts_memberships_account_id_fkey1";

alter table "public"."accounts_memberships" add constraint "accounts_memberships_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE not valid;

alter table "public"."accounts_memberships" validate constraint "accounts_memberships_organization_id_fkey";

alter table "public"."agency_statuses" add constraint "agency_statuses_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."agency_statuses" validate constraint "agency_statuses_agency_id_fkey1";

alter table "public"."chats" add constraint "chats_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_agency_id_fkey1";

alter table "public"."chats" add constraint "chats_client_organization_id_fkey1" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_client_organization_id_fkey1";

alter table "public"."client_services" add constraint "client_services_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."client_services" validate constraint "client_services_agency_id_fkey1";

alter table "public"."client_services" add constraint "client_services_client_organization_id_fkey1" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."client_services" validate constraint "client_services_client_organization_id_fkey1";

alter table "public"."clients" add constraint "clients_user_client_id_fkey" FOREIGN KEY (user_client_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_user_client_id_fkey";

alter table "public"."embeds" add constraint "embeds_organization_id_fkey1" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."embeds" validate constraint "embeds_organization_id_fkey1";

alter table "public"."folder_files" add constraint "folder_files_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folder_files" validate constraint "folder_files_agency_id_fkey";

alter table "public"."folder_files" add constraint "folder_files_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folder_files" validate constraint "folder_files_client_organization_id_fkey";

alter table "public"."folders" add constraint "folders_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folders" validate constraint "folders_agency_id_fkey";

alter table "public"."folders" add constraint "folders_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folders" validate constraint "folders_client_organization_id_fkey";

alter table "public"."invitations" add constraint "invitations_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invitations" validate constraint "invitations_organization_id_fkey";

alter table "public"."message_reads" add constraint "message_reads_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."message_reads" validate constraint "message_reads_chat_id_fkey";

alter table "public"."orders_v2" add constraint "orders_v2_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_agency_id_fkey";

alter table "public"."orders_v2" add constraint "orders_v2_client_organization_id_fkey1" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_client_organization_id_fkey1";

alter table "public"."organization_settings" add constraint "organization_settings_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."organization_settings" validate constraint "organization_settings_organization_id_fkey";

alter table "public"."organization_subdomains" add constraint "organization_subdomains_organization_id_fkey1" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."organization_subdomains" validate constraint "organization_subdomains_organization_id_fkey1";

alter table "public"."services" add constraint "services_propietary_organization_id_fkey" FOREIGN KEY (propietary_organization_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."services" validate constraint "services_propietary_organization_id_fkey";

alter table "public"."tags" add constraint "tags_organization_id_fkey1" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tags" validate constraint "tags_organization_id_fkey1";

-- alter table "public"."invitations" add constraint "invitations_email_account_id_key" UNIQUE using index "invitations_email_account_id_key";

set check_function_bodies = off;

DROP TRIGGER IF EXISTS after_account_insert_default_agency_statuses ON public.accounts;

CREATE OR REPLACE FUNCTION public.insert_default_agency_statuses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert default states for all organizations
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

-- Migration to add organization_id to accounts_memberships
-- This migration keeps account_id and adds organization_id as a reference to organizations

BEGIN;

-- 1. Add the organization_id column to accounts_memberships
ALTER TABLE public.accounts_memberships 
ADD COLUMN IF NOT EXISTS organization_id uuid;

-- 2. Update the organization_id column with the current values of account_id
-- This assumes that the account IDs that represent organizations are the same as those used in the organizations table
UPDATE public.accounts_memberships
SET organization_id = account_id;

BEGIN;

UPDATE public.invitations
SET organization_id = (
    SELECT organization_id
    FROM public.accounts_memberships
    WHERE user_id = public.invitations.invited_by
    LIMIT 1
);

DELETE FROM public.invitations
WHERE organization_id IS NULL;

COMMIT;

alter table public.invitations
alter column organization_id set not null;

-- 4. Create an index on organization_id for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_memberships_organization_id ON public.accounts_memberships(organization_id);

-- -- 5. Make organization_id NOT NULL after ensuring all records have a value
-- ALTER TABLE public.accounts_memberships
-- ALTER COLUMN organization_id SET NOT NULL;

-- Verify that the migration was completed correctly
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

BEGIN;

ALTER TABLE public.credits_usage 
ADD COLUMN IF NOT EXISTS organization_id uuid;

UPDATE public.credits_usage
SET organization_id = account_id;

CREATE INDEX IF NOT EXISTS idx_credits_usage_organization_id ON public.credits_usage(organization_id);

ALTER TABLE public.credits_usage
ALTER COLUMN organization_id SET NOT NULL;

alter table "public"."credits_usage" add constraint "credits_usage_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."credits_usage" validate constraint "credits_usage_organization_id_fkey";
COMMIT; 

BEGIN;

-- 1. Add the organization_id column to embed_accounts
ALTER TABLE public.embed_accounts 
ADD COLUMN IF NOT EXISTS organization_id uuid;

-- 2. Update the organization_id column with the current values of account_id
-- This assumes that the account IDs that represent organizations are the same as those used in the organizations table
UPDATE public.embed_accounts
SET organization_id = account_id;

-- 4. Create an index on organization_id for better performance
CREATE INDEX IF NOT EXISTS idx_embed_accounts_organization_id ON public.embed_accounts(organization_id);

-- 5. Make organization_id NOT NULL after ensuring all records have a value
ALTER TABLE public.embed_accounts
ALTER COLUMN organization_id SET NOT NULL;

-- Verify that the migration was completed correctly
DO $$
DECLARE
  count_embeds_accounts INTEGER;
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_embeds_accounts FROM public.embed_accounts;
  SELECT COUNT(*) INTO null_count FROM public.embed_accounts WHERE organization_id IS NULL;
  
  RAISE NOTICE 'Migration completed: % memberships updated, % with NULL organization_id', 
    count_embeds_accounts, null_count;
  
  IF null_count > 0 THEN
    RAISE WARNING 'There are % records with NULL organization_id', null_count;
  END IF;
END $$;

COMMIT;

alter table "public"."embed_accounts" add constraint "embed_accounts_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."embed_accounts" validate constraint "embed_accounts_organization_id_fkey";

ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "organization_id" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "stripe_id" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "slug" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "is_personal_account" CASCADE;
ALTER TABLE "public"."accounts" DROP COLUMN IF EXISTS "primary_owner_user_id" CASCADE;

alter table "public"."clients" add constraint "clients_agency_id_fkey1" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_agency_id_fkey1";

alter table "public"."clients" add constraint "clients_organization_client_id_fkey1" FOREIGN KEY (organization_client_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_organization_client_id_fkey1";

alter table "public"."invitations" drop column if exists "account_id" cascade;

-- add organization_id to user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS organization_id uuid;

-- delete pk from user_id of user_settings
ALTER TABLE public.user_settings
DROP CONSTRAINT IF EXISTS user_settings_pkey;

-- add fk to organization_id of user_settings
ALTER TABLE public.user_settings
ADD CONSTRAINT user_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

ALTER TABLE public.user_settings
validate constraint "user_settings_organization_id_fkey";