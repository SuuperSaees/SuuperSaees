create table "public"."tokens" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "id_token_provider" text not null default ''::text,
    "provider" text not null default ''::text,
    "expires_at" timestamp with time zone,
    "refresh_token" text not null default ''::text,
    "access_token" text not null default ''::text
);


alter table "public"."tokens" enable row level security;

alter table "public"."subscriptions" add column "days_used" integer not null default 0;

alter table "public"."subscriptions" add column "token_id" text not null default ''::text;

alter table "public"."subscriptions" alter column "propietary_organization_id" drop not null;

CREATE UNIQUE INDEX tokens_pkey ON public.tokens USING btree (id);

alter table "public"."tokens" add constraint "tokens_pkey" PRIMARY KEY using index "tokens_pkey";
grant delete on table "public"."tokens" to "anon";

grant insert on table "public"."tokens" to "anon";

grant references on table "public"."tokens" to "anon";

grant select on table "public"."tokens" to "anon";

grant trigger on table "public"."tokens" to "anon";

grant truncate on table "public"."tokens" to "anon";

grant update on table "public"."tokens" to "anon";

grant delete on table "public"."tokens" to "authenticated";

grant insert on table "public"."tokens" to "authenticated";

grant references on table "public"."tokens" to "authenticated";

grant select on table "public"."tokens" to "authenticated";

grant trigger on table "public"."tokens" to "authenticated";

grant truncate on table "public"."tokens" to "authenticated";

grant update on table "public"."tokens" to "authenticated";

grant delete on table "public"."tokens" to "service_role";

grant insert on table "public"."tokens" to "service_role";

grant references on table "public"."tokens" to "service_role";

grant select on table "public"."tokens" to "service_role";

grant trigger on table "public"."tokens" to "service_role";

grant truncate on table "public"."tokens" to "service_role";

grant update on table "public"."tokens" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."tokens"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."tokens"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on email"
on "public"."tokens"
as permissive
for update
to public
using (true)
with check (true);