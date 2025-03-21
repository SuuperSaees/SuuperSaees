alter table "public"."orders_v2" add column "brief_id" uuid;

alter table "public"."orders_v2" add constraint "orders_v2_brief_id_fkey" FOREIGN KEY (brief_id) REFERENCES briefs(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_brief_id_fkey";