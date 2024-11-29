alter table "public"."briefs" add column "deleted_on" timestamp with time zone;

alter table "public"."briefs" alter column "propietary_organization_id" set not null;

alter table "public"."briefs" alter column "propietary_organization_id" set data type uuid using "propietary_organization_id"::uuid;

alter table "public"."briefs" add constraint "briefs_propietary_organization_id_fkey" FOREIGN KEY (propietary_organization_id) REFERENCES accounts(id) ON UPDATE CASCADE not valid;

alter table "public"."briefs" validate constraint "briefs_propietary_organization_id_fkey";


