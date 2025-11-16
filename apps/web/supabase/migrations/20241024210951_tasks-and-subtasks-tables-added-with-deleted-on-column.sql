alter table "public"."subtasks" add column "deleted_on" timestamp with time zone;

alter table "public"."tasks" add column "deleted_on" timestamp with time zone;
