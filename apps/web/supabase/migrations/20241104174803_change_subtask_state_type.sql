alter table "public"."subtasks" alter column "state" set data type text using "state"::text;
alter table "public"."subtasks" alter column "state" drop default;



