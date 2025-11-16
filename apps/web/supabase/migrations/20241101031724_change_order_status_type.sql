alter table "public"."orders_v2" alter column "status" set data type text using "status"::text;
alter table "public"."orders_v2" alter column "status" set default 'pending'::text;



