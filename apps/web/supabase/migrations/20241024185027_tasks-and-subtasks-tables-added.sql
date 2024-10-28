drop policy "delete_tasks" on "public"."tasks";

drop policy "insert_tasks" on "public"."tasks";

drop policy "select_tasks" on "public"."tasks";

drop policy "update_tasks" on "public"."tasks";

drop index if exists "public"."ix_tasks_account_id";

create table "public"."subtasks" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "parent_task_id" uuid,
    "content" text,
    "completed" boolean default false,
    "state" order_status_types default 'in_progress'::order_status_types,
    "priority" priority_types default 'low'::priority_types
);


alter table "public"."subtasks" enable row level security;

alter table "public"."tasks" drop column "account_id";

alter table "public"."tasks" drop column "description";

alter table "public"."tasks" drop column "done";

alter table "public"."tasks" drop column "title";

alter table "public"."tasks" drop column "updated_at";

alter table "public"."tasks" add column "completed" boolean default false;

alter table "public"."tasks" add column "name" text;

alter table "public"."tasks" add column "order_id" text;

CREATE UNIQUE INDEX subtasks_pkey ON public.subtasks USING btree (id);

alter table "public"."subtasks" add constraint "subtasks_pkey" PRIMARY KEY using index "subtasks_pkey";

alter table "public"."subtasks" add constraint "subtasks_parent_task_id_fkey" FOREIGN KEY (parent_task_id) REFERENCES tasks(id) not valid;

alter table "public"."subtasks" validate constraint "subtasks_parent_task_id_fkey";

alter table "public"."tasks" add constraint "tasks_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(uuid) not valid;

alter table "public"."tasks" validate constraint "tasks_order_id_fkey";

grant delete on table "public"."subtasks" to "anon";

grant insert on table "public"."subtasks" to "anon";

grant references on table "public"."subtasks" to "anon";

grant select on table "public"."subtasks" to "anon";

grant trigger on table "public"."subtasks" to "anon";

grant truncate on table "public"."subtasks" to "anon";

grant update on table "public"."subtasks" to "anon";

grant delete on table "public"."subtasks" to "authenticated";

grant insert on table "public"."subtasks" to "authenticated";

grant references on table "public"."subtasks" to "authenticated";

grant select on table "public"."subtasks" to "authenticated";

grant trigger on table "public"."subtasks" to "authenticated";

grant truncate on table "public"."subtasks" to "authenticated";

grant update on table "public"."subtasks" to "authenticated";

grant delete on table "public"."subtasks" to "service_role";

grant insert on table "public"."subtasks" to "service_role";

grant references on table "public"."subtasks" to "service_role";

grant select on table "public"."subtasks" to "service_role";

grant trigger on table "public"."subtasks" to "service_role";

grant truncate on table "public"."subtasks" to "service_role";

grant update on table "public"."subtasks" to "service_role";

create policy "allow_all_to_authenticated_users"
on "public"."subtasks"
as permissive
for all
to authenticated
using (true);


create policy "allow_all_to_authenticated_users"
on "public"."tasks"
as permissive
for all
to authenticated
using (true);
