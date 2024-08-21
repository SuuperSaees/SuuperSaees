drop policy "Allow create user for all authenticated" on "public"."accounts";

drop policy "accounts_read" on "public"."accounts";

drop policy "accounts_self_update" on "public"."accounts";

alter table "public"."clients" drop constraint "clients_id_key";

alter table "public"."orders_v2" drop constraint "orders_v2_customer_id_fkey";

drop index if exists "public"."clients_id_key";

alter table "public"."accounts" add column "organization_id" uuid;

alter table "public"."accounts" alter column "created_at" set default now();

alter table "public"."clients" drop column "client_organization";

alter table "public"."clients" drop column "created_at";

alter table "public"."clients" drop column "email";

alter table "public"."clients" drop column "name";

alter table "public"."clients" drop column "picture_url";

alter table "public"."clients" drop column "propietary_organization";

alter table "public"."clients" drop column "propietary_organization_id";

alter table "public"."clients" drop column "role";

alter table "public"."clients" add column "agency_id" uuid not null;

alter table "public"."clients" add column "agency_id2" uuid;

alter table "public"."clients" add column "organization_client_id" uuid not null;

alter table "public"."clients" add column "user_client_id" uuid not null;

CREATE UNIQUE INDEX clients_id_key1 ON public.clients USING btree (id);

CREATE UNIQUE INDEX clients_id_key ON public.clients USING btree (agency_id2);

alter table "public"."clients" add constraint "clients_id_key1" UNIQUE using index "clients_id_key1";

alter table "public"."clients" add constraint "clients_id_key" UNIQUE using index "clients_id_key";

alter table "public"."orders_v2" add constraint "orders_v2_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_customer_id_fkey";

create policy "Creat for all authenticated"
on "public"."accounts_memberships"
as permissive
for insert
to authenticated
with check (true);


create policy "Update for all authenticated"
on "public"."accounts_memberships"
as permissive
for update
to authenticated
using (true);


create policy "accounts_read"
on "public"."accounts"
as permissive
for select
to authenticated
using (true);


create policy "accounts_self_update"
on "public"."accounts"
as permissive
for update
to authenticated
using (true)
with check (true);



