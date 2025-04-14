create table "public"."organization_subdomains" (
    "id" uuid not null default gen_random_uuid(),
    "subdomain_id" uuid not null,
    "organization_id" uuid not null
);


alter table "public"."organization_subdomains" enable row level security;

create table "public"."subdomains" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid not null,
    "provider" character varying(255) not null default 'suuper'::character varying,
    "status" character varying(255) not null,
    "namespace" character varying(255) not null,
    "service_name" character varying(255),
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "deleted_on" timestamp without time zone
);


alter table "public"."subdomains" enable row level security;

CREATE UNIQUE INDEX organization_subdomains_pkey ON public.organization_subdomains USING btree (id);

CREATE UNIQUE INDEX subdomains_pkey ON public.subdomains USING btree (id);

alter table "public"."organization_subdomains" add constraint "organization_subdomains_pkey" PRIMARY KEY using index "organization_subdomains_pkey";

alter table "public"."subdomains" add constraint "subdomains_pkey" PRIMARY KEY using index "subdomains_pkey";

alter table "public"."organization_subdomains" add constraint "organization_subdomains_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES accounts(id) not valid;

alter table "public"."organization_subdomains" validate constraint "organization_subdomains_organization_id_fkey";

alter table "public"."organization_subdomains" add constraint "organization_subdomains_subdomain_id_fkey" FOREIGN KEY (subdomain_id) REFERENCES subdomains(id) not valid;

alter table "public"."organization_subdomains" validate constraint "organization_subdomains_subdomain_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_deleted_on()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.deleted_on IS NOT NULL THEN
        -- Eliminar la relación en organization_subdomains
        DELETE FROM organization_subdomains WHERE subdomain_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_service_brief_relation(service_id bigint, brief_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.service_briefs (service_id, brief_id)
    VALUES (service_id, brief_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_service_brief_relation(service_id uuid, brief_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.service_briefs (service_id, brief_id)
    VALUES (service_id, brief_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."organization_subdomains" to "anon";

grant insert on table "public"."organization_subdomains" to "anon";

grant references on table "public"."organization_subdomains" to "anon";

grant select on table "public"."organization_subdomains" to "anon";

grant trigger on table "public"."organization_subdomains" to "anon";

grant truncate on table "public"."organization_subdomains" to "anon";

grant update on table "public"."organization_subdomains" to "anon";

grant delete on table "public"."organization_subdomains" to "authenticated";

grant insert on table "public"."organization_subdomains" to "authenticated";

grant references on table "public"."organization_subdomains" to "authenticated";

grant select on table "public"."organization_subdomains" to "authenticated";

grant trigger on table "public"."organization_subdomains" to "authenticated";

grant truncate on table "public"."organization_subdomains" to "authenticated";

grant update on table "public"."organization_subdomains" to "authenticated";

grant delete on table "public"."organization_subdomains" to "service_role";

grant insert on table "public"."organization_subdomains" to "service_role";

grant references on table "public"."organization_subdomains" to "service_role";

grant select on table "public"."organization_subdomains" to "service_role";

grant trigger on table "public"."organization_subdomains" to "service_role";

grant truncate on table "public"."organization_subdomains" to "service_role";

grant update on table "public"."organization_subdomains" to "service_role";

grant delete on table "public"."subdomains" to "anon";

grant insert on table "public"."subdomains" to "anon";

grant references on table "public"."subdomains" to "anon";

grant select on table "public"."subdomains" to "anon";

grant trigger on table "public"."subdomains" to "anon";

grant truncate on table "public"."subdomains" to "anon";

grant update on table "public"."subdomains" to "anon";

grant delete on table "public"."subdomains" to "authenticated";

grant insert on table "public"."subdomains" to "authenticated";

grant references on table "public"."subdomains" to "authenticated";

grant select on table "public"."subdomains" to "authenticated";

grant trigger on table "public"."subdomains" to "authenticated";

grant truncate on table "public"."subdomains" to "authenticated";

grant update on table "public"."subdomains" to "authenticated";

grant delete on table "public"."subdomains" to "service_role";

grant insert on table "public"."subdomains" to "service_role";

grant references on table "public"."subdomains" to "service_role";

grant select on table "public"."subdomains" to "service_role";

grant trigger on table "public"."subdomains" to "service_role";

grant truncate on table "public"."subdomains" to "service_role";

grant update on table "public"."subdomains" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."organization_subdomains"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."organization_subdomains"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."organization_subdomains"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for users based on email"
on "public"."organization_subdomains"
as permissive
for update
to authenticated
using (true)
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."subdomains"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."subdomains"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."subdomains"
as permissive
for update
to public
using (true)
with check (true);

CREATE TRIGGER check_deleted_on_subdomains AFTER UPDATE OF deleted_on ON public.subdomains FOR EACH ROW EXECUTE FUNCTION handle_deleted_on();

CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON public.subdomains FOR EACH ROW EXECUTE FUNCTION update_updated_at();