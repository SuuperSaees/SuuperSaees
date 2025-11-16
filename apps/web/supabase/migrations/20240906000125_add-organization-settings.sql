create type "public"."organization_setting_key" as enum ('theme_color', 'background_color', 'logo_url', 'timezone', 'language', 'date_format');

create table "public"."organization_settings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "account_id" uuid not null,
    "key" organization_setting_key not null,
    "value" text not null
);


alter table "public"."organization_settings" enable row level security;

CREATE UNIQUE INDEX organization_settings_account_id_key ON public.organization_settings USING btree (account_id);

CREATE UNIQUE INDEX organization_settings_pkey ON public.organization_settings USING btree (id);

alter table "public"."organization_settings" add constraint "organization_settings_pkey" PRIMARY KEY using index "organization_settings_pkey";

alter table "public"."organization_settings" add constraint "organization_settings_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."organization_settings" validate constraint "organization_settings_account_id_fkey";

alter table "public"."organization_settings" add constraint "organization_settings_account_id_key" UNIQUE using index "organization_settings_account_id_key";

grant delete on table "public"."organization_settings" to "anon";

grant insert on table "public"."organization_settings" to "anon";

grant references on table "public"."organization_settings" to "anon";

grant select on table "public"."organization_settings" to "anon";

grant trigger on table "public"."organization_settings" to "anon";

grant truncate on table "public"."organization_settings" to "anon";

grant update on table "public"."organization_settings" to "anon";

grant delete on table "public"."organization_settings" to "authenticated";

grant insert on table "public"."organization_settings" to "authenticated";

grant references on table "public"."organization_settings" to "authenticated";

grant select on table "public"."organization_settings" to "authenticated";

grant trigger on table "public"."organization_settings" to "authenticated";

grant truncate on table "public"."organization_settings" to "authenticated";

grant update on table "public"."organization_settings" to "authenticated";

grant delete on table "public"."organization_settings" to "service_role";

grant insert on table "public"."organization_settings" to "service_role";

grant references on table "public"."organization_settings" to "service_role";

grant select on table "public"."organization_settings" to "service_role";

grant trigger on table "public"."organization_settings" to "service_role";

grant truncate on table "public"."organization_settings" to "service_role";

grant update on table "public"."organization_settings" to "service_role";

create policy "Create for all authenticated users"
on "public"."organization_settings"
as permissive
for insert
to authenticated
with check (true);


create policy "Delete for all authenticated users"
on "public"."organization_settings"
as permissive
for delete
to authenticated
using (true);


create policy "Read for all authenticated users"
on "public"."organization_settings"
as permissive
for select
to authenticated
using (true);


create policy "Update for all authenticated users"
on "public"."organization_settings"
as permissive
for update
to authenticated
using (true);




