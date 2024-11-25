alter table "public"."order_followers" alter column "client_member_id" set not null;

alter table "public"."order_followers" alter column "order_id" set not null;
