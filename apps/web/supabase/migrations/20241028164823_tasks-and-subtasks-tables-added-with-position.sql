alter table "public"."tasks" drop constraint "tasks_order_id_fkey";

alter type "public"."activity_type" rename to "activity_type__old_version_to_be_dropped";

create type "public"."activity_type" as enum ('message', 'review', 'status', 'priority', 'assign', 'due_date', 'description', 'title', 'assigned_to', 'task');

alter table "public"."activities" alter column type type "public"."activity_type" using type::text::"public"."activity_type";

drop type "public"."activity_type__old_version_to_be_dropped";

alter table "public"."subtasks" add column "position" bigint;

alter table "public"."tasks" add column "position" bigint;

alter table "public"."tasks" alter column "order_id" set data type bigint using "order_id"::bigint;

alter table "public"."tasks" add constraint "tasks_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_order_id_fkey";
