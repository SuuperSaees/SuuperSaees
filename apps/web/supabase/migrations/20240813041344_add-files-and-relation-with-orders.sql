create type "public"."file_types" as enum ('image', 'video', 'pdf', 'fig');

alter table "public"."orders_v2" drop constraint "orders_v2_customer_id_fkey";

alter table "public"."clients" drop constraint "clients_pkey";

drop index if exists "public"."clients_pkey";

create table "public"."files" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "type" file_types not null,
    "url" text not null,
    "size" numeric not null
);


alter table "public"."files" enable row level security;

create table "public"."order_files" (
    "file_id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "order_id" bigint not null
);


alter table "public"."order_files" enable row level security;

CREATE UNIQUE INDEX files_pkey ON public.files USING btree (id);

CREATE UNIQUE INDEX order_files_pkey ON public.order_files USING btree (file_id, order_id);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

alter table "public"."files" add constraint "files_pkey" PRIMARY KEY using index "files_pkey";

alter table "public"."order_files" add constraint "order_files_pkey" PRIMARY KEY using index "order_files_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."order_files" add constraint "order_files_file_id_fkey" FOREIGN KEY (file_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_files" validate constraint "order_files_file_id_fkey";

alter table "public"."order_files" add constraint "order_files_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_files" validate constraint "order_files_order_id_fkey";

alter table "public"."orders_v2" add constraint "orders_v2_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES clients(id) ON DELETE CASCADE not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_customer_id_fkey";

grant delete on table "public"."files" to "anon";

grant insert on table "public"."files" to "anon";

grant references on table "public"."files" to "anon";

grant select on table "public"."files" to "anon";

grant trigger on table "public"."files" to "anon";

grant truncate on table "public"."files" to "anon";

grant update on table "public"."files" to "anon";

grant delete on table "public"."files" to "authenticated";

grant insert on table "public"."files" to "authenticated";

grant references on table "public"."files" to "authenticated";

grant select on table "public"."files" to "authenticated";

grant trigger on table "public"."files" to "authenticated";

grant truncate on table "public"."files" to "authenticated";

grant update on table "public"."files" to "authenticated";

grant delete on table "public"."files" to "service_role";

grant insert on table "public"."files" to "service_role";

grant references on table "public"."files" to "service_role";

grant select on table "public"."files" to "service_role";

grant trigger on table "public"."files" to "service_role";

grant truncate on table "public"."files" to "service_role";

grant update on table "public"."files" to "service_role";

grant delete on table "public"."order_files" to "anon";

grant insert on table "public"."order_files" to "anon";

grant references on table "public"."order_files" to "anon";

grant select on table "public"."order_files" to "anon";

grant trigger on table "public"."order_files" to "anon";

grant truncate on table "public"."order_files" to "anon";

grant update on table "public"."order_files" to "anon";

grant delete on table "public"."order_files" to "authenticated";

grant insert on table "public"."order_files" to "authenticated";

grant references on table "public"."order_files" to "authenticated";

grant select on table "public"."order_files" to "authenticated";

grant trigger on table "public"."order_files" to "authenticated";

grant truncate on table "public"."order_files" to "authenticated";

grant update on table "public"."order_files" to "authenticated";

grant delete on table "public"."order_files" to "service_role";

grant insert on table "public"."order_files" to "service_role";

grant references on table "public"."order_files" to "service_role";

grant select on table "public"."order_files" to "service_role";

grant trigger on table "public"."order_files" to "service_role";

grant truncate on table "public"."order_files" to "service_role";

grant update on table "public"."order_files" to "service_role";

create policy "Allow create to all authenticated users"
on "public"."files"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow delete to all authenticated users"
on "public"."files"
as permissive
for delete
to authenticated
using (true);


create policy "Allow update to all authenticated users"
on "public"."files"
as permissive
for update
to authenticated
using (true);


create policy "Read to all authenticated users"
on "public"."files"
as permissive
for select
to authenticated
using (true);


create policy "Allo read to all authenticated users"
on "public"."order_files"
as permissive
for select
to authenticated
using (true);


create policy "Allow create to all authenticated users"
on "public"."order_files"
as permissive
for insert
to authenticated
with check (true);


create policy "Allow delete to all authenticated users"
on "public"."order_files"
as permissive
for delete
to authenticated
using (true);


create policy "Allow update to all authenticated users"
on "public"."order_files"
as permissive
for update
to authenticated
using (true);


