create table "public"."order_followers" (
    "created_at" timestamp with time zone default now(),
    "client_member_id" uuid default gen_random_uuid(),
    "order_id" bigint
);


alter table "public"."order_followers" enable row level security;

alter table "public"."order_followers" add constraint "order_followers_client_member_id_fkey" FOREIGN KEY (client_member_id) REFERENCES accounts(id) not valid;

alter table "public"."order_followers" validate constraint "order_followers_client_member_id_fkey";

alter table "public"."order_followers" add constraint "order_followers_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) not valid;

alter table "public"."order_followers" validate constraint "order_followers_order_id_fkey";

grant delete on table "public"."order_followers" to "anon";

grant insert on table "public"."order_followers" to "anon";

grant references on table "public"."order_followers" to "anon";

grant select on table "public"."order_followers" to "anon";

grant trigger on table "public"."order_followers" to "anon";

grant truncate on table "public"."order_followers" to "anon";

grant update on table "public"."order_followers" to "anon";

grant delete on table "public"."order_followers" to "authenticated";

grant insert on table "public"."order_followers" to "authenticated";

grant references on table "public"."order_followers" to "authenticated";

grant select on table "public"."order_followers" to "authenticated";

grant trigger on table "public"."order_followers" to "authenticated";

grant truncate on table "public"."order_followers" to "authenticated";

grant update on table "public"."order_followers" to "authenticated";

grant delete on table "public"."order_followers" to "service_role";

grant insert on table "public"."order_followers" to "service_role";

grant references on table "public"."order_followers" to "service_role";

grant select on table "public"."order_followers" to "service_role";

grant trigger on table "public"."order_followers" to "service_role";

grant truncate on table "public"."order_followers" to "service_role";

grant update on table "public"."order_followers" to "service_role";

create policy "Enable delete for users authenticated"
on "public"."order_followers"
as permissive
for delete
to authenticated
using (true);


create policy "Enable insert for authenticated users only"
on "public"."order_followers"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."order_followers"
as permissive
for select
to authenticated
using (true);


create policy "Enable update for users authenticated"
on "public"."order_followers"
as permissive
for update
to authenticated
using (true)
with check (true);