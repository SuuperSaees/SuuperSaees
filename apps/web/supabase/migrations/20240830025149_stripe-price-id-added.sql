drop policy "Create for all authenticated users" on "public"."order_assignations";

drop policy "Delete for all authenticated users" on "public"."order_assignations";

drop policy "Read for all authenticated users" on "public"."order_assignations";

drop policy "Update" on "public"."order_assignations";

drop policy "invitations_read_self" on "public"."invitations";

revoke delete on table "public"."order_assignations" from "anon";

revoke insert on table "public"."order_assignations" from "anon";

revoke references on table "public"."order_assignations" from "anon";

revoke select on table "public"."order_assignations" from "anon";

revoke trigger on table "public"."order_assignations" from "anon";

revoke truncate on table "public"."order_assignations" from "anon";

revoke update on table "public"."order_assignations" from "anon";

revoke delete on table "public"."order_assignations" from "authenticated";

revoke insert on table "public"."order_assignations" from "authenticated";

revoke references on table "public"."order_assignations" from "authenticated";

revoke select on table "public"."order_assignations" from "authenticated";

revoke trigger on table "public"."order_assignations" from "authenticated";

revoke truncate on table "public"."order_assignations" from "authenticated";

revoke update on table "public"."order_assignations" from "authenticated";

revoke delete on table "public"."order_assignations" from "service_role";

revoke insert on table "public"."order_assignations" from "service_role";

revoke references on table "public"."order_assignations" from "service_role";

revoke select on table "public"."order_assignations" from "service_role";

revoke trigger on table "public"."order_assignations" from "service_role";

revoke truncate on table "public"."order_assignations" from "service_role";

revoke update on table "public"."order_assignations" from "service_role";

alter table "public"."order_assignations" drop constraint "order_assignations_agency_member_id_fkey";

alter table "public"."order_assignations" drop constraint "order_assignations_order_id_fkey";

alter table "public"."order_assignations" drop constraint "order_assignations_pkey";

drop index if exists "public"."order_assignations_pkey";

drop table "public"."order_assignations";

alter table "public"."activities" drop column "actor";

alter table "public"."activities" drop column "preposition";

alter table "public"."activities" drop column "previous_value";

alter table "public"."activities" drop column "value";

alter table "public"."orders_v2" drop column "agency_id";

alter table "public"."orders_v2" drop column "stripe_account_id";

alter table "public"."orders_v2" add column "assigned_to" text[];

alter table "public"."services" add column "price_id" text;

create policy "invitations_read_self"
on "public"."invitations"
as permissive
for select
to authenticated
using (has_role_on_account(account_id));



