alter table "public"."briefs" add column "description" text;

alter table "public"."briefs" add column "image_url" text;

alter table "public"."briefs" alter column "name" set not null;
