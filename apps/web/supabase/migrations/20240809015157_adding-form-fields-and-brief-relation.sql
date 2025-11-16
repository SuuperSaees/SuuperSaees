create type "public"."field_types" as enum ('date', 'multiple_choice', 'select', 'text');

create table "public"."brief_form_fields" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "brief_id" uuid not null,
    "form_field_id" uuid not null
);


alter table "public"."brief_form_fields" enable row level security;

create table "public"."brief_responses" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "brief_id" uuid not null,
    "form_field_id" uuid not null,
    "response" text not null
);


alter table "public"."brief_responses" enable row level security;

create table "public"."form_fields" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "type" field_types not null default 'text'::field_types,
    "description" text,
    "label" text not null,
    "options" jsonb[],
    "placeholder" text default ''::text
);


alter table "public"."form_fields" enable row level security;

CREATE UNIQUE INDEX brief_form_fields_pkey ON public.brief_form_fields USING btree (id);

CREATE UNIQUE INDEX brief_responses_pkey ON public.brief_responses USING btree (id);

CREATE UNIQUE INDEX form_fields_pkey ON public.form_fields USING btree (id);

alter table "public"."brief_form_fields" add constraint "brief_form_fields_pkey" PRIMARY KEY using index "brief_form_fields_pkey";

alter table "public"."brief_responses" add constraint "brief_responses_pkey" PRIMARY KEY using index "brief_responses_pkey";

alter table "public"."form_fields" add constraint "form_fields_pkey" PRIMARY KEY using index "form_fields_pkey";

alter table "public"."brief_form_fields" add constraint "brief_form_fields_brief_id_fkey" FOREIGN KEY (brief_id) REFERENCES briefs(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."brief_form_fields" validate constraint "brief_form_fields_brief_id_fkey";

alter table "public"."brief_form_fields" add constraint "brief_form_fields_form_field_id_fkey" FOREIGN KEY (form_field_id) REFERENCES form_fields(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."brief_form_fields" validate constraint "brief_form_fields_form_field_id_fkey";

alter table "public"."brief_responses" add constraint "brief_responses_brief_id_fkey" FOREIGN KEY (brief_id) REFERENCES briefs(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."brief_responses" validate constraint "brief_responses_brief_id_fkey";

alter table "public"."brief_responses" add constraint "brief_responses_form_field_id_fkey" FOREIGN KEY (form_field_id) REFERENCES form_fields(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."brief_responses" validate constraint "brief_responses_form_field_id_fkey";

grant delete on table "public"."brief_form_fields" to "anon";

grant insert on table "public"."brief_form_fields" to "anon";

grant references on table "public"."brief_form_fields" to "anon";

grant select on table "public"."brief_form_fields" to "anon";

grant trigger on table "public"."brief_form_fields" to "anon";

grant truncate on table "public"."brief_form_fields" to "anon";

grant update on table "public"."brief_form_fields" to "anon";

grant delete on table "public"."brief_form_fields" to "authenticated";

grant insert on table "public"."brief_form_fields" to "authenticated";

grant references on table "public"."brief_form_fields" to "authenticated";

grant select on table "public"."brief_form_fields" to "authenticated";

grant trigger on table "public"."brief_form_fields" to "authenticated";

grant truncate on table "public"."brief_form_fields" to "authenticated";

grant update on table "public"."brief_form_fields" to "authenticated";

grant delete on table "public"."brief_form_fields" to "service_role";

grant insert on table "public"."brief_form_fields" to "service_role";

grant references on table "public"."brief_form_fields" to "service_role";

grant select on table "public"."brief_form_fields" to "service_role";

grant trigger on table "public"."brief_form_fields" to "service_role";

grant truncate on table "public"."brief_form_fields" to "service_role";

grant update on table "public"."brief_form_fields" to "service_role";

grant delete on table "public"."brief_responses" to "anon";

grant insert on table "public"."brief_responses" to "anon";

grant references on table "public"."brief_responses" to "anon";

grant select on table "public"."brief_responses" to "anon";

grant trigger on table "public"."brief_responses" to "anon";

grant truncate on table "public"."brief_responses" to "anon";

grant update on table "public"."brief_responses" to "anon";

grant delete on table "public"."brief_responses" to "authenticated";

grant insert on table "public"."brief_responses" to "authenticated";

grant references on table "public"."brief_responses" to "authenticated";

grant select on table "public"."brief_responses" to "authenticated";

grant trigger on table "public"."brief_responses" to "authenticated";

grant truncate on table "public"."brief_responses" to "authenticated";

grant update on table "public"."brief_responses" to "authenticated";

grant delete on table "public"."brief_responses" to "service_role";

grant insert on table "public"."brief_responses" to "service_role";

grant references on table "public"."brief_responses" to "service_role";

grant select on table "public"."brief_responses" to "service_role";

grant trigger on table "public"."brief_responses" to "service_role";

grant truncate on table "public"."brief_responses" to "service_role";

grant update on table "public"."brief_responses" to "service_role";

grant delete on table "public"."form_fields" to "anon";

grant insert on table "public"."form_fields" to "anon";

grant references on table "public"."form_fields" to "anon";

grant select on table "public"."form_fields" to "anon";

grant trigger on table "public"."form_fields" to "anon";

grant truncate on table "public"."form_fields" to "anon";

grant update on table "public"."form_fields" to "anon";

grant delete on table "public"."form_fields" to "authenticated";

grant insert on table "public"."form_fields" to "authenticated";

grant references on table "public"."form_fields" to "authenticated";

grant select on table "public"."form_fields" to "authenticated";

grant trigger on table "public"."form_fields" to "authenticated";

grant truncate on table "public"."form_fields" to "authenticated";

grant update on table "public"."form_fields" to "authenticated";

grant delete on table "public"."form_fields" to "service_role";

grant insert on table "public"."form_fields" to "service_role";

grant references on table "public"."form_fields" to "service_role";

grant select on table "public"."form_fields" to "service_role";

grant trigger on table "public"."form_fields" to "service_role";

grant truncate on table "public"."form_fields" to "service_role";

grant update on table "public"."form_fields" to "service_role";

create policy "Create for all authenticated users"
on "public"."brief_form_fields"
as permissive
for insert
to authenticated
with check (true);


create policy "Delete to all authenticated users"
on "public"."brief_form_fields"
as permissive
for delete
to authenticated
using (true);


create policy "Read all to authenticated users"
on "public"."brief_form_fields"
as permissive
for select
to authenticated
using (true);


create policy "Update to all authenticated users"
on "public"."brief_form_fields"
as permissive
for update
to authenticated
using (true);


create policy "Create to all authenticated users"
on "public"."brief_responses"
as permissive
for insert
to authenticated
with check (true);


create policy "Delete to all authenticated users"
on "public"."brief_responses"
as permissive
for delete
to authenticated
using (true);


create policy "Read to all authenticated users"
on "public"."brief_responses"
as permissive
for select
to authenticated
using (true);


create policy "Update to all authenticated users"
on "public"."brief_responses"
as permissive
for update
to authenticated
using (true);


create policy "Create to all authenticated users"
on "public"."form_fields"
as permissive
for insert
to authenticated
with check (true);


create policy "Delete to all authenticated users"
on "public"."form_fields"
as permissive
for delete
to authenticated
using (true);


create policy "Read to all authenticated users"
on "public"."form_fields"
as permissive
for select
to authenticated
using (true);


create policy "Update to all authenticated users"
on "public"."form_fields"
as permissive
for update
to authenticated
using (true);




