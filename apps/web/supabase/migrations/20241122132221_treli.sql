create type "public"."service_status" as enum ('active', 'inactive', 'draft', 'expired', 'paused', 'blocked', 'scheduled', 'pending', 'deleted');

create type "public"."visibility" as enum ('public', 'private');

alter table "public"."config" alter column "billing_provider" drop default;

-- alter type "public"."billing_provider" rename to "billing_provider__old_version_to_be_dropped";

-- create type "public"."billing_provider" as enum ('stripe', 'lemon-squeezy', 'paddle', 'treli', 'suuper');

DO $$
BEGIN
    -- Add 'stripe' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'stripe' AND enumtypid = 'public.billing_provider'::regtype) THEN
        ALTER TYPE public.billing_provider ADD VALUE 'stripe';
    END IF;

    -- Add 'treli' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'treli' AND enumtypid = 'public.billing_provider'::regtype) THEN
        ALTER TYPE public.billing_provider ADD VALUE 'treli';
    END IF;

    -- Add 'suuper' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suuper' AND enumtypid = 'public.billing_provider'::regtype) THEN
        ALTER TYPE public.billing_provider ADD VALUE 'suuper';
    END IF;
END $$;

COMMIT;

create table "public"."billing_accounts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_on" timestamp with time zone,
    "provider" billing_provider not null default 'suuper'::billing_provider,
    "provider_id" text not null,
    "account_id" uuid not null,
    "credentials" jsonb
);

alter table "public"."billing_accounts" enable row level security;

create table "public"."billing_services" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "service_id" bigint not null,
    "provider_id" text not null,
    "status" service_status not null default 'active'::service_status,
    "updated_at" timestamp with time zone default now(),
    "deleted_on" timestamp with time zone
);

alter table "public"."billing_services" enable row level security;

alter table "public"."billing_customers" alter column provider type "public"."billing_provider" using provider::text::"public"."billing_provider";

alter table "public"."config" alter column billing_provider type "public"."billing_provider" using billing_provider::text::"public"."billing_provider";

alter table "public"."orders" alter column billing_provider type "public"."billing_provider" using billing_provider::text::"public"."billing_provider";

alter table "public"."subscriptions" alter column billing_provider type "public"."billing_provider" using billing_provider::text::"public"."billing_provider";

alter table "public"."config" alter column "billing_provider" set default 'stripe'::billing_provider;

-- drop type "public"."billing_provider__old_version_to_be_dropped"; -- drop the old type, comment this line if you want to keep the old type

alter table "public"."services" add column "deleted_on" timestamp with time zone;

alter table "public"."services" add column "visibility" visibility not null default 'public'::visibility;

alter table "public"."services" alter column "status" set default 'active'::service_status;

alter table "public"."services" alter column "status" set not null;

alter table "public"."services" alter column "status" set data type service_status using "status"::service_status;

CREATE UNIQUE INDEX billing_accounts_pkey ON public.billing_accounts USING btree (id);

CREATE UNIQUE INDEX billing_services_pkey ON public.billing_services USING btree (id);

alter table "public"."billing_accounts" add constraint "billing_accounts_pkey" PRIMARY KEY using index "billing_accounts_pkey";

alter table "public"."billing_services" add constraint "billing_services_pkey" PRIMARY KEY using index "billing_services_pkey";

alter table "public"."billing_accounts" add constraint "billing_accounts_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."billing_accounts" validate constraint "billing_accounts_account_id_fkey";

alter table "public"."billing_services" add constraint "billing_services_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."billing_services" validate constraint "billing_services_service_id_fkey";

grant delete on table "public"."billing_accounts" to "anon";

grant insert on table "public"."billing_accounts" to "anon";

grant references on table "public"."billing_accounts" to "anon";

grant select on table "public"."billing_accounts" to "anon";

grant trigger on table "public"."billing_accounts" to "anon";

grant truncate on table "public"."billing_accounts" to "anon";

grant update on table "public"."billing_accounts" to "anon";

grant delete on table "public"."billing_accounts" to "authenticated";

grant insert on table "public"."billing_accounts" to "authenticated";

grant references on table "public"."billing_accounts" to "authenticated";

grant select on table "public"."billing_accounts" to "authenticated";

grant trigger on table "public"."billing_accounts" to "authenticated";

grant truncate on table "public"."billing_accounts" to "authenticated";

grant update on table "public"."billing_accounts" to "authenticated";

grant delete on table "public"."billing_accounts" to "service_role";

grant insert on table "public"."billing_accounts" to "service_role";

grant references on table "public"."billing_accounts" to "service_role";

grant select on table "public"."billing_accounts" to "service_role";

grant trigger on table "public"."billing_accounts" to "service_role";

grant truncate on table "public"."billing_accounts" to "service_role";

grant update on table "public"."billing_accounts" to "service_role";

grant delete on table "public"."billing_services" to "anon";

grant insert on table "public"."billing_services" to "anon";

grant references on table "public"."billing_services" to "anon";

grant select on table "public"."billing_services" to "anon";

grant trigger on table "public"."billing_services" to "anon";

grant truncate on table "public"."billing_services" to "anon";

grant update on table "public"."billing_services" to "anon";

grant delete on table "public"."billing_services" to "authenticated";

grant insert on table "public"."billing_services" to "authenticated";

grant references on table "public"."billing_services" to "authenticated";

grant select on table "public"."billing_services" to "authenticated";

grant trigger on table "public"."billing_services" to "authenticated";

grant truncate on table "public"."billing_services" to "authenticated";

grant update on table "public"."billing_services" to "authenticated";

grant delete on table "public"."billing_services" to "service_role";

grant insert on table "public"."billing_services" to "service_role";

grant references on table "public"."billing_services" to "service_role";

grant select on table "public"."billing_services" to "service_role";

grant trigger on table "public"."billing_services" to "service_role";

grant truncate on table "public"."billing_services" to "service_role";

grant update on table "public"."billing_services" to "service_role";