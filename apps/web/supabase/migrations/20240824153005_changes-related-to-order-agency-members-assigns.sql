create table "public"."order_assignations" (
    "agency_member_id" uuid not null,
    "order_id" bigint not null
);


alter table "public"."order_assignations" enable row level security;

alter table "public"."orders_v2" drop column "assigned_to";

CREATE UNIQUE INDEX order_assignations_pkey ON public.order_assignations USING btree (agency_member_id, order_id);

alter table "public"."order_assignations" add constraint "order_assignations_pkey" PRIMARY KEY using index "order_assignations_pkey";

alter table "public"."order_assignations" add constraint "order_assignations_agency_member_id_fkey" FOREIGN KEY (agency_member_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_assignations" validate constraint "order_assignations_agency_member_id_fkey";

alter table "public"."order_assignations" add constraint "order_assignations_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_assignations" validate constraint "order_assignations_order_id_fkey";

grant delete on table "public"."order_assignations" to "anon";

grant insert on table "public"."order_assignations" to "anon";

grant references on table "public"."order_assignations" to "anon";

grant select on table "public"."order_assignations" to "anon";

grant trigger on table "public"."order_assignations" to "anon";

grant truncate on table "public"."order_assignations" to "anon";

grant update on table "public"."order_assignations" to "anon";

grant delete on table "public"."order_assignations" to "authenticated";

grant insert on table "public"."order_assignations" to "authenticated";

grant references on table "public"."order_assignations" to "authenticated";

grant select on table "public"."order_assignations" to "authenticated";

grant trigger on table "public"."order_assignations" to "authenticated";

grant truncate on table "public"."order_assignations" to "authenticated";

grant update on table "public"."order_assignations" to "authenticated";

grant delete on table "public"."order_assignations" to "service_role";

grant insert on table "public"."order_assignations" to "service_role";

grant references on table "public"."order_assignations" to "service_role";

grant select on table "public"."order_assignations" to "service_role";

grant trigger on table "public"."order_assignations" to "service_role";

grant truncate on table "public"."order_assignations" to "service_role";

grant update on table "public"."order_assignations" to "service_role";

create policy "Create for all authenticated users"
on "public"."order_assignations"
as permissive
for insert
to authenticated
with check (true);


create policy "Delete for all authenticated users"
on "public"."order_assignations"
as permissive
for delete
to authenticated
using (true);


create policy "Read for all authenticated users"
on "public"."order_assignations"
as permissive
for select
to authenticated
using (true);


create policy "Update"
on "public"."order_assignations"
as permissive
for update
to authenticated
using (true);





