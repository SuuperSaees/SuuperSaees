create type "public"."plugin_status" as enum ('installed', 'uninstalled', 'failed', 'in progress');

create type "public"."plugin_type" as enum ('tool', 'internal', 'external', 'integration');

create table "public"."plugins" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" text not null,
    "deleted_on" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "status" plugin_status not null default 'uninstalled'::plugin_status,
    "type" plugin_type not null default 'external'::plugin_type,
    "provider" text not null,
    "credentials" jsonb not null,
    "account_id" uuid not null
);


CREATE INDEX idx_plugins_account_id ON public.plugins USING btree (account_id);

CREATE INDEX idx_plugins_status ON public.plugins USING btree (status);

CREATE INDEX idx_plugins_type ON public.plugins USING btree (type);

CREATE UNIQUE INDEX plugins_pkey ON public.plugins USING btree (id);

alter table "public"."plugins" add constraint "plugins_pkey" PRIMARY KEY using index "plugins_pkey";

alter table "public"."plugins" add constraint "plugins_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."plugins" validate constraint "plugins_account_id_fkey";

grant delete on table "public"."plugins" to "anon";

grant insert on table "public"."plugins" to "anon";

grant references on table "public"."plugins" to "anon";

grant select on table "public"."plugins" to "anon";

grant trigger on table "public"."plugins" to "anon";

grant truncate on table "public"."plugins" to "anon";

grant update on table "public"."plugins" to "anon";

grant delete on table "public"."plugins" to "authenticated";

grant insert on table "public"."plugins" to "authenticated";

grant references on table "public"."plugins" to "authenticated";

grant select on table "public"."plugins" to "authenticated";

grant trigger on table "public"."plugins" to "authenticated";

grant truncate on table "public"."plugins" to "authenticated";

grant update on table "public"."plugins" to "authenticated";

grant delete on table "public"."plugins" to "service_role";

grant insert on table "public"."plugins" to "service_role";

grant references on table "public"."plugins" to "service_role";

grant select on table "public"."plugins" to "service_role";

grant trigger on table "public"."plugins" to "service_role";

grant truncate on table "public"."plugins" to "service_role";

grant update on table "public"."plugins" to "service_role";


