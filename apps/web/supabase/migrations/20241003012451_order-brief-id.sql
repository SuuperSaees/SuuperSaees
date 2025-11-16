alter table "public"."orders_v2" drop column "brief_id";

alter table "public"."orders_v2" add column "brief_ids" uuid[];

