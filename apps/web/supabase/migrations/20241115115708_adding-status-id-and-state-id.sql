alter table "public"."orders_v2" add column "status_id" bigint;

alter table "public"."subtasks" add column "state_id" bigint;

alter table "public"."orders_v2" add constraint "orders_v2_status_id_fkey" FOREIGN KEY (status_id) REFERENCES agency_statuses(id) ON DELETE SET NULL not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_status_id_fkey";

alter table "public"."subtasks" add constraint "subtasks_state_id_fkey" FOREIGN KEY (state_id) REFERENCES agency_statuses(id) ON DELETE SET NULL not valid;

alter table "public"."subtasks" validate constraint "subtasks_state_id_fkey";

alter table "public"."agency_statuses" add column "deleted_on" timestamp with time zone;