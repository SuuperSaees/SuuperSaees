create table "public"."order_tags" (
    "created_at" timestamp with time zone not null default now(),
    "order_id" bigint,
    "tag_id" uuid
);

alter table "public"."order_tags" enable row level security;

create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_on" timestamp with time zone,
    "name" text not null,
    "organization_id" uuid not null,
    "color" text default '#ffffff'::text
);


alter table "public"."tags" enable row level security;


CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."order_tags" add constraint "order_tags_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON DELETE CASCADE not valid;

alter table "public"."order_tags" validate constraint "order_tags_order_id_fkey";

alter table "public"."order_tags" add constraint "order_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_tags" validate constraint "order_tags_tag_id_fkey";

alter table "public"."tags" add constraint "tags_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tags" validate constraint "tags_organization_id_fkey";

grant delete on table "public"."order_tags" to "anon";

grant insert on table "public"."order_tags" to "anon";

grant references on table "public"."order_tags" to "anon";

grant select on table "public"."order_tags" to "anon";

grant trigger on table "public"."order_tags" to "anon";

grant truncate on table "public"."order_tags" to "anon";

grant update on table "public"."order_tags" to "anon";

grant delete on table "public"."order_tags" to "authenticated";

grant insert on table "public"."order_tags" to "authenticated";

grant references on table "public"."order_tags" to "authenticated";

grant select on table "public"."order_tags" to "authenticated";

grant trigger on table "public"."order_tags" to "authenticated";

grant truncate on table "public"."order_tags" to "authenticated";

grant update on table "public"."order_tags" to "authenticated";

grant delete on table "public"."order_tags" to "service_role";

grant insert on table "public"."order_tags" to "service_role";

grant references on table "public"."order_tags" to "service_role";

grant select on table "public"."order_tags" to "service_role";

grant trigger on table "public"."order_tags" to "service_role";

grant truncate on table "public"."order_tags" to "service_role";

grant update on table "public"."order_tags" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

-- TAGS POLICIES --

create policy "Enable delete for users based on user_id"
on "public"."tags"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."tags"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for users based on email"
on "public"."tags"
as permissive
for update
to authenticated
using (true)
with check (true);

-- ORDER TAGS POLICIES --

create policy "Enable delete for users based on user_id"
on "public"."order_tags"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."order_tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."order_tags"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for users based on email"
on "public"."order_tags"
as permissive
for update
to authenticated
using (true)
with check (true);