create type "public"."chat_role_type" as enum ('project_manager', 'assistant', 'owner', 'guest');

create table "public"."chat_members" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "chat_id" uuid not null,
    "deleted_on" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "settings" jsonb default '{}'::jsonb,
    "type" chat_role_type not null default 'guest'::chat_role_type,
    "visibility" boolean not null default true
);


alter table "public"."chat_messages" alter column "role" set data type chat_role_type using "role"::text::chat_role_type;

CREATE UNIQUE INDEX chat_members_pkey ON public.chat_members USING btree (id);

alter table "public"."chat_members" add constraint "chat_members_pkey" PRIMARY KEY using index "chat_members_pkey";

grant delete on table "public"."chat_members" to "anon";

grant insert on table "public"."chat_members" to "anon";

grant references on table "public"."chat_members" to "anon";

grant select on table "public"."chat_members" to "anon";

grant trigger on table "public"."chat_members" to "anon";

grant truncate on table "public"."chat_members" to "anon";

grant update on table "public"."chat_members" to "anon";

grant delete on table "public"."chat_members" to "authenticated";

grant insert on table "public"."chat_members" to "authenticated";

grant references on table "public"."chat_members" to "authenticated";

grant select on table "public"."chat_members" to "authenticated";

grant trigger on table "public"."chat_members" to "authenticated";

grant truncate on table "public"."chat_members" to "authenticated";

grant update on table "public"."chat_members" to "authenticated";

grant delete on table "public"."chat_members" to "service_role";

grant insert on table "public"."chat_members" to "service_role";

grant references on table "public"."chat_members" to "service_role";

grant select on table "public"."chat_members" to "service_role";

grant trigger on table "public"."chat_members" to "service_role";

grant truncate on table "public"."chat_members" to "service_role";

grant update on table "public"."chat_members" to "service_role";


