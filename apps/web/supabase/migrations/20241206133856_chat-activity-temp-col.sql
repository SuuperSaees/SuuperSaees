
alter table "public"."activities" add column "temp_id" uuid;

alter table "public"."files" add column "temp_id" uuid;

alter table "public"."messages" add column "temp_id" uuid;

alter table "public"."orders_v2" add column "updated_at" timestamp with time zone;

alter table "public"."reviews" add column "temp_id" uuid;

