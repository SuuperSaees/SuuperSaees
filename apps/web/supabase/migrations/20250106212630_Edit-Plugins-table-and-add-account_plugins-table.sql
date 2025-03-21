alter table "public"."plugins" drop constraint "plugins_account_id_fkey";

drop index if exists "public"."idx_plugins_account_id";

drop index if exists "public"."idx_plugins_status";

create table "public"."account_plugins" (
    "id" uuid not null default gen_random_uuid(),
    "plugin_id" uuid not null,
    "account_id" uuid not null,
    "status" plugin_status,
    "credentials" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_on" timestamp with time zone,
    "provider_id" uuid not null
);


alter table "public"."plugins" drop column "account_id";

alter table "public"."plugins" drop column "credentials";

alter table "public"."plugins" drop column "provider";

alter table "public"."plugins" drop column "provider_id";

alter table "public"."plugins" drop column "status";

alter table "public"."plugins" add column "description" text;

alter table "public"."plugins" add column "metadata" jsonb;

alter table "public"."plugins" add column "name" text not null;

CREATE UNIQUE INDEX account_plugins_pkey ON public.account_plugins USING btree (id);

CREATE INDEX idx_account_plugins_account_id ON public.account_plugins USING btree (account_id);

CREATE INDEX idx_account_plugins_deleted_on ON public.account_plugins USING btree (deleted_on);

CREATE INDEX idx_account_plugins_plugin_id ON public.account_plugins USING btree (plugin_id);

CREATE INDEX idx_account_plugins_status ON public.account_plugins USING btree (status);

CREATE INDEX idx_plugins_delete_on ON public.plugins USING btree (deleted_on);

CREATE INDEX idx_plugins_deleted_on ON public.plugins USING btree (deleted_on);

CREATE UNIQUE INDEX unique_provider_account ON public.account_plugins USING btree (provider_id, account_id);

alter table "public"."account_plugins" add constraint "account_plugins_pkey" PRIMARY KEY using index "account_plugins_pkey";

alter table "public"."account_plugins" add constraint "account_plugins_plugin_id_fkey" FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE not valid;

alter table "public"."account_plugins" validate constraint "account_plugins_plugin_id_fkey";

alter table "public"."account_plugins" add constraint "unique_provider_account" UNIQUE using index "unique_provider_account";

grant delete on table "public"."account_plugins" to "anon";

grant insert on table "public"."account_plugins" to "anon";

grant references on table "public"."account_plugins" to "anon";

grant select on table "public"."account_plugins" to "anon";

grant trigger on table "public"."account_plugins" to "anon";

grant truncate on table "public"."account_plugins" to "anon";

grant update on table "public"."account_plugins" to "anon";

grant delete on table "public"."account_plugins" to "authenticated";

grant insert on table "public"."account_plugins" to "authenticated";

grant references on table "public"."account_plugins" to "authenticated";

grant select on table "public"."account_plugins" to "authenticated";

grant trigger on table "public"."account_plugins" to "authenticated";

grant truncate on table "public"."account_plugins" to "authenticated";

grant update on table "public"."account_plugins" to "authenticated";

grant delete on table "public"."account_plugins" to "service_role";

grant insert on table "public"."account_plugins" to "service_role";

grant references on table "public"."account_plugins" to "service_role";

grant select on table "public"."account_plugins" to "service_role";

grant trigger on table "public"."account_plugins" to "service_role";

grant truncate on table "public"."account_plugins" to "service_role";

grant update on table "public"."account_plugins" to "service_role";
