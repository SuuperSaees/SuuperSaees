alter table "public"."clients" alter column "client_organization" set default ''::text;

alter table "public"."clients" alter column "client_organization" set not null;

alter table "public"."clients" alter column "email" set default ''::text;

alter table "public"."clients" alter column "email" set not null;

alter table "public"."clients" alter column "name" set default ''::text;

alter table "public"."clients" alter column "name" set not null;

alter table "public"."clients" alter column "picture_url" set default ''::text;

alter table "public"."clients" alter column "picture_url" set not null;

alter table "public"."clients" alter column "propietary_organization" set default ''::text;

alter table "public"."clients" alter column "propietary_organization" set not null;

alter table "public"."clients" alter column "propietary_organization_id" set default ''::text;

alter table "public"."clients" alter column "propietary_organization_id" set not null;

alter table "public"."clients" alter column "role" set default ''::text;

alter table "public"."clients" alter column "role" set not null;


