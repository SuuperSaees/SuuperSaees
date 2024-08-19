alter table "public"."order_files" drop constraint "order_files_order_id_fkey";

alter table "public"."files" alter column "type" set data type text using "type"::text;

alter table "public"."order_files" alter column "order_id" set data type text using "order_id"::text;

CREATE UNIQUE INDEX orders_v2_uuid_key ON public.orders_v2 USING btree (uuid);

alter table "public"."orders_v2" add constraint "orders_v2_uuid_key" UNIQUE using index "orders_v2_uuid_key";

alter table "public"."order_files" add constraint "order_files_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(uuid) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_files" validate constraint "order_files_order_id_fkey";


