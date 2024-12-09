alter table "public"."brief_responses" add constraint "brief_responses_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(uuid) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."brief_responses" validate constraint "brief_responses_order_id_fkey";

