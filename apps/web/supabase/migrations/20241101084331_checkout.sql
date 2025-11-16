create table "public"."checkout_services" (
    "id" uuid not null default gen_random_uuid(),
    "service_id" bigint,
    "checkout_id" uuid
);


alter table "public"."checkout_services" enable row level security;

create table "public"."checkouts" (
    "id" uuid not null default gen_random_uuid(),
    "provider" text not null,
    "provider_id" text not null,
    "created_at" timestamp with time zone,
    "deleted_on" timestamp with time zone
);


alter table "public"."checkouts" enable row level security;

CREATE UNIQUE INDEX checkout_services_pkey ON public.checkout_services USING btree (id);

CREATE UNIQUE INDEX checkouts_id_key ON public.checkouts USING btree (id);

CREATE UNIQUE INDEX checkouts_pkey ON public.checkouts USING btree (id);

alter table "public"."checkout_services" add constraint "checkout_services_pkey" PRIMARY KEY using index "checkout_services_pkey";

alter table "public"."checkouts" add constraint "checkouts_pkey" PRIMARY KEY using index "checkouts_pkey";

alter table "public"."checkout_services" add constraint "checkout_services_checkout_id_fkey" FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."checkout_services" validate constraint "checkout_services_checkout_id_fkey";

alter table "public"."checkout_services" add constraint "checkout_services_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."checkout_services" validate constraint "checkout_services_service_id_fkey";

alter table "public"."checkouts" add constraint "checkouts_id_key" UNIQUE using index "checkouts_id_key";

grant delete on table "public"."checkout_services" to "anon";

grant insert on table "public"."checkout_services" to "anon";

grant references on table "public"."checkout_services" to "anon";

grant select on table "public"."checkout_services" to "anon";

grant trigger on table "public"."checkout_services" to "anon";

grant truncate on table "public"."checkout_services" to "anon";

grant update on table "public"."checkout_services" to "anon";

grant delete on table "public"."checkout_services" to "authenticated";

grant insert on table "public"."checkout_services" to "authenticated";

grant references on table "public"."checkout_services" to "authenticated";

grant select on table "public"."checkout_services" to "authenticated";

grant trigger on table "public"."checkout_services" to "authenticated";

grant truncate on table "public"."checkout_services" to "authenticated";

grant update on table "public"."checkout_services" to "authenticated";

grant delete on table "public"."checkout_services" to "service_role";

grant insert on table "public"."checkout_services" to "service_role";

grant references on table "public"."checkout_services" to "service_role";

grant select on table "public"."checkout_services" to "service_role";

grant trigger on table "public"."checkout_services" to "service_role";

grant truncate on table "public"."checkout_services" to "service_role";

grant update on table "public"."checkout_services" to "service_role";

grant delete on table "public"."checkouts" to "anon";

grant insert on table "public"."checkouts" to "anon";

grant references on table "public"."checkouts" to "anon";

grant select on table "public"."checkouts" to "anon";

grant trigger on table "public"."checkouts" to "anon";

grant truncate on table "public"."checkouts" to "anon";

grant update on table "public"."checkouts" to "anon";

grant delete on table "public"."checkouts" to "authenticated";

grant insert on table "public"."checkouts" to "authenticated";

grant references on table "public"."checkouts" to "authenticated";

grant select on table "public"."checkouts" to "authenticated";

grant trigger on table "public"."checkouts" to "authenticated";

grant truncate on table "public"."checkouts" to "authenticated";

grant update on table "public"."checkouts" to "authenticated";

grant delete on table "public"."checkouts" to "service_role";

grant insert on table "public"."checkouts" to "service_role";

grant references on table "public"."checkouts" to "service_role";

grant select on table "public"."checkouts" to "service_role";

grant trigger on table "public"."checkouts" to "service_role";

grant truncate on table "public"."checkouts" to "service_role";

grant update on table "public"."checkouts" to "service_role";

create policy "Enable delete for users based on user_id"
on "public"."checkout_services"
as permissive
for delete
to public
using (true);


create policy "Enable insert for authenticated users only"
on "public"."checkout_services"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."checkout_services"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."checkout_services"
as permissive
for update
to public
using (true)
with check (true);


create policy "Enable delete for users based on user_id"
on "public"."checkouts"
as permissive
for delete
to public
using (true);


create policy "Enable insert for authenticated users only"
on "public"."checkouts"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."checkouts"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."checkouts"
as permissive
for update
to public
using (true)
with check (true);