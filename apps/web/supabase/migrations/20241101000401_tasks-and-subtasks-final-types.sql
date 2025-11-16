alter table "public"."subtasks" drop constraint "subtasks_parent_task_id_fkey";

create table "public"."subtask_assignations" (
    "agency_member_id" uuid not null,
    "subtask_id" uuid
);


alter table "public"."subtask_assignations" enable row level security;

create table "public"."subtask_followers" (
    "created_at" timestamp with time zone not null default now(),
    "client_member_id" uuid,
    "subtask_id" uuid
);


alter table "public"."subtask_followers" enable row level security;

CREATE UNIQUE INDEX subtask_assignations_pkey ON public.subtask_assignations USING btree (agency_member_id);

alter table "public"."subtask_assignations" add constraint "subtask_assignations_pkey" PRIMARY KEY using index "subtask_assignations_pkey";

alter table "public"."subtask_assignations" add constraint "subtask_assignations_agency_member_id_fkey" FOREIGN KEY (agency_member_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtask_assignations" validate constraint "subtask_assignations_agency_member_id_fkey";

alter table "public"."subtask_assignations" add constraint "subtask_assignations_subtask_id_fkey" FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtask_assignations" validate constraint "subtask_assignations_subtask_id_fkey";

alter table "public"."subtask_followers" add constraint "subtask_followers_client_member_id_fkey" FOREIGN KEY (client_member_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtask_followers" validate constraint "subtask_followers_client_member_id_fkey";

alter table "public"."subtask_followers" add constraint "subtask_followers_subtask_id_fkey" FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtask_followers" validate constraint "subtask_followers_subtask_id_fkey";

alter table "public"."subtasks" add constraint "subtasks_parent_task_id_fkey" FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtasks" validate constraint "subtasks_parent_task_id_fkey";

grant delete on table "public"."subtask_assignations" to "anon";

grant insert on table "public"."subtask_assignations" to "anon";

grant references on table "public"."subtask_assignations" to "anon";

grant select on table "public"."subtask_assignations" to "anon";

grant trigger on table "public"."subtask_assignations" to "anon";

grant truncate on table "public"."subtask_assignations" to "anon";

grant update on table "public"."subtask_assignations" to "anon";

grant delete on table "public"."subtask_assignations" to "authenticated";

grant insert on table "public"."subtask_assignations" to "authenticated";

grant references on table "public"."subtask_assignations" to "authenticated";

grant select on table "public"."subtask_assignations" to "authenticated";

grant trigger on table "public"."subtask_assignations" to "authenticated";

grant truncate on table "public"."subtask_assignations" to "authenticated";

grant update on table "public"."subtask_assignations" to "authenticated";

grant delete on table "public"."subtask_assignations" to "service_role";

grant insert on table "public"."subtask_assignations" to "service_role";

grant references on table "public"."subtask_assignations" to "service_role";

grant select on table "public"."subtask_assignations" to "service_role";

grant trigger on table "public"."subtask_assignations" to "service_role";

grant truncate on table "public"."subtask_assignations" to "service_role";

grant update on table "public"."subtask_assignations" to "service_role";

grant delete on table "public"."subtask_followers" to "anon";

grant insert on table "public"."subtask_followers" to "anon";

grant references on table "public"."subtask_followers" to "anon";

grant select on table "public"."subtask_followers" to "anon";

grant trigger on table "public"."subtask_followers" to "anon";

grant truncate on table "public"."subtask_followers" to "anon";

grant update on table "public"."subtask_followers" to "anon";

grant delete on table "public"."subtask_followers" to "authenticated";

grant insert on table "public"."subtask_followers" to "authenticated";

grant references on table "public"."subtask_followers" to "authenticated";

grant select on table "public"."subtask_followers" to "authenticated";

grant trigger on table "public"."subtask_followers" to "authenticated";

grant truncate on table "public"."subtask_followers" to "authenticated";

grant update on table "public"."subtask_followers" to "authenticated";

grant delete on table "public"."subtask_followers" to "service_role";

grant insert on table "public"."subtask_followers" to "service_role";

grant references on table "public"."subtask_followers" to "service_role";

grant select on table "public"."subtask_followers" to "service_role";

grant trigger on table "public"."subtask_followers" to "service_role";

grant truncate on table "public"."subtask_followers" to "service_role";

grant update on table "public"."subtask_followers" to "service_role";

create policy "allow_all_to_authenticated_users"
on "public"."subtask_assignations"
as permissive
for all
to authenticated
using (true);


create policy "allow_all_to_authenticated_users"
on "public"."subtask_followers"
as permissive
for all
to authenticated
using (true);


