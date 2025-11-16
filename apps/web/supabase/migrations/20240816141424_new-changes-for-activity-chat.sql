alter table "public"."activities" add column "order_id" bigint not null;

alter table "public"."messages" add column "order_id" bigint not null;

alter table "public"."messages" add column "user_id" uuid not null;

alter table "public"."reviews" add column "order_id" bigint not null;

alter table "public"."activities" add constraint "activities_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."activities" validate constraint "activities_order_id_fkey";

alter table "public"."messages" add constraint "messages_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_order_id_fkey";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

alter table "public"."reviews" add constraint "reviews_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_order_id_fkey";



