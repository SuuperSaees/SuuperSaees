alter table "public"."clients" drop constraint "clients_id_key";

drop index if exists "public"."clients_id_key";

alter table "public"."clients" drop column "agency_id2";

alter table "public"."orders_v2" add column "client_organization_id" uuid not null;

alter table "public"."orders_v2" add constraint "orders_v2_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_client_organization_id_fkey";

