alter table "public"."brief_responses" drop constraint "brief_responses_order_id_fkey";

alter table "public"."brief_responses" alter column "order_id" set not null;


