create table "public"."sessions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "client_name" text,
    "client_email" text,
    "client_address" text,
    "client_city" text,
    "client_country" text,
    "client_state" text,
    "client_postal_code" text,
    "provider" text,
    "deleted_on" timestamp with time zone,
    "provider_id" text
);


alter table "public"."sessions" enable row level security;

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

grant delete on table "public"."sessions" to "anon";

grant insert on table "public"."sessions" to "anon";

grant references on table "public"."sessions" to "anon";

grant select on table "public"."sessions" to "anon";

grant trigger on table "public"."sessions" to "anon";

grant truncate on table "public"."sessions" to "anon";

grant update on table "public"."sessions" to "anon";

grant delete on table "public"."sessions" to "authenticated";

grant insert on table "public"."sessions" to "authenticated";

grant references on table "public"."sessions" to "authenticated";

grant select on table "public"."sessions" to "authenticated";

grant trigger on table "public"."sessions" to "authenticated";

grant truncate on table "public"."sessions" to "authenticated";

grant update on table "public"."sessions" to "authenticated";

grant delete on table "public"."sessions" to "service_role";

grant insert on table "public"."sessions" to "service_role";

grant references on table "public"."sessions" to "service_role";

grant select on table "public"."sessions" to "service_role";

grant trigger on table "public"."sessions" to "service_role";

grant truncate on table "public"."sessions" to "service_role";

grant update on table "public"."sessions" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."sessions"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."sessions"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."sessions"
as permissive
for update
to public
using (true)
with check (true);