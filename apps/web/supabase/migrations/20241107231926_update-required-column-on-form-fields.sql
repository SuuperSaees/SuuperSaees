drop trigger if exists "after_insert_subdomain" on "public"."subdomains";

alter table "public"."form_fields" alter column "required" drop not null;


