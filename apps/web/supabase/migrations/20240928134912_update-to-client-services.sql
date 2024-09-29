alter table "public"."client_services" drop constraint "client_services_service_id_fkey";

alter table "public"."client_services" add column "agency_id" uuid not null;

alter table "public"."services" alter column "name" set not null;

alter table "public"."client_services" add constraint "client_services_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."client_services" validate constraint "client_services_agency_id_fkey";

alter table "public"."client_services" add constraint "client_services_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE CASCADE not valid;

alter table "public"."client_services" validate constraint "client_services_service_id_fkey";




