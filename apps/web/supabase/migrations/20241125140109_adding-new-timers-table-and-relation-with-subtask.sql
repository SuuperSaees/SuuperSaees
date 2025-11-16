create table "public"."subtask_timers" (
    "subtask_id" uuid not null,
    "timer_id" uuid not null
);


alter table "public"."subtask_timers" enable row level security;

create table "public"."timers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "start_time" bigint,
    "elapsed_time" integer,
    "end_time" bigint,
    "created_at" timestamp with time zone default now(),
    "status" text,
    "deleted_on" timestamp with time zone,
    "timestamp" time without time zone,
    "updated_at" timestamp with time zone,
    "name" text
);


alter table "public"."timers" enable row level security;

CREATE UNIQUE INDEX active_timers_pkey ON public.timers USING btree (id);

CREATE UNIQUE INDEX subtask_timers_pkey ON public.subtask_timers USING btree (subtask_id, timer_id);

alter table "public"."subtask_timers" add constraint "subtask_timers_pkey" PRIMARY KEY using index "subtask_timers_pkey";

alter table "public"."timers" add constraint "active_timers_pkey" PRIMARY KEY using index "active_timers_pkey";

alter table "public"."subtask_timers" add constraint "subtask_timers_subtask_id_fkey" FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtask_timers" validate constraint "subtask_timers_subtask_id_fkey";

alter table "public"."subtask_timers" add constraint "subtask_timers_timer_id_fkey" FOREIGN KEY (timer_id) REFERENCES timers(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."subtask_timers" validate constraint "subtask_timers_timer_id_fkey";

alter table "public"."timers" add constraint "active_timers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."timers" validate constraint "active_timers_user_id_fkey";

grant delete on table "public"."subtask_timers" to "anon";

grant insert on table "public"."subtask_timers" to "anon";

grant references on table "public"."subtask_timers" to "anon";

grant select on table "public"."subtask_timers" to "anon";

grant trigger on table "public"."subtask_timers" to "anon";

grant truncate on table "public"."subtask_timers" to "anon";

grant update on table "public"."subtask_timers" to "anon";

grant delete on table "public"."subtask_timers" to "authenticated";

grant insert on table "public"."subtask_timers" to "authenticated";

grant references on table "public"."subtask_timers" to "authenticated";

grant select on table "public"."subtask_timers" to "authenticated";

grant trigger on table "public"."subtask_timers" to "authenticated";

grant truncate on table "public"."subtask_timers" to "authenticated";

grant update on table "public"."subtask_timers" to "authenticated";

grant delete on table "public"."subtask_timers" to "service_role";

grant insert on table "public"."subtask_timers" to "service_role";

grant references on table "public"."subtask_timers" to "service_role";

grant select on table "public"."subtask_timers" to "service_role";

grant trigger on table "public"."subtask_timers" to "service_role";

grant truncate on table "public"."subtask_timers" to "service_role";

grant update on table "public"."subtask_timers" to "service_role";

grant delete on table "public"."timers" to "anon";

grant insert on table "public"."timers" to "anon";

grant references on table "public"."timers" to "anon";

grant select on table "public"."timers" to "anon";

grant trigger on table "public"."timers" to "anon";

grant truncate on table "public"."timers" to "anon";

grant update on table "public"."timers" to "anon";

grant delete on table "public"."timers" to "authenticated";

grant insert on table "public"."timers" to "authenticated";

grant references on table "public"."timers" to "authenticated";

grant select on table "public"."timers" to "authenticated";

grant trigger on table "public"."timers" to "authenticated";

grant truncate on table "public"."timers" to "authenticated";

grant update on table "public"."timers" to "authenticated";

grant delete on table "public"."timers" to "service_role";

grant insert on table "public"."timers" to "service_role";

grant references on table "public"."timers" to "service_role";

grant select on table "public"."timers" to "service_role";

grant trigger on table "public"."timers" to "service_role";

grant truncate on table "public"."timers" to "service_role";

grant update on table "public"."timers" to "service_role";

create policy "Users can delete their own timers"
on "public"."timers"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can insert their own timers"
on "public"."timers"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Users can update their own timers"
on "public"."timers"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "Users can view their own timers"
on "public"."timers"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));
