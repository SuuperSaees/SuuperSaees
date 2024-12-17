create type "public"."annotations_status" as enum ('active', 'completed', 'draft');

create type "public"."message_category" as enum ('chat_message', 'annotation');

create table "public"."annotations" (
    "id" uuid not null default gen_random_uuid(),
    "file_id" uuid not null,
    "user_id" uuid not null,
    "status" annotations_status not null default 'active'::annotations_status,
    "position_x" double precision,
    "position_y" double precision,
    "page_number" bigint,
    "number" numeric,
    "message_id" uuid,
    "deleted_on" timestamp without time zone,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
);


alter table "public"."messages" add column "parent_id" uuid;

alter table "public"."messages" add column "type" message_category not null default 'chat_message'::message_category;

CREATE UNIQUE INDEX annotations_pkey ON public.annotations USING btree (id);

CREATE INDEX idx_annotations_file_id ON public.annotations USING btree (file_id);

CREATE INDEX idx_annotations_message_id ON public.annotations USING btree (message_id);

CREATE INDEX idx_annotations_user_id ON public.annotations USING btree (user_id);

alter table "public"."annotations" add constraint "annotations_pkey" PRIMARY KEY using index "annotations_pkey";

alter table "public"."annotations" add constraint "annotations_file_id_fkey" FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE not valid;

alter table "public"."annotations" validate constraint "annotations_file_id_fkey";

alter table "public"."annotations" add constraint "annotations_message_id_fkey" FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE not valid;

alter table "public"."annotations" validate constraint "annotations_message_id_fkey";

alter table "public"."annotations" add constraint "annotations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE SET NULL not valid;

alter table "public"."annotations" validate constraint "annotations_user_id_fkey";

alter table "public"."messages" add constraint "messages_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "messages_parent_id_fkey";

grant delete on table "public"."annotations" to "anon";

grant insert on table "public"."annotations" to "anon";

grant references on table "public"."annotations" to "anon";

grant select on table "public"."annotations" to "anon";

grant trigger on table "public"."annotations" to "anon";

grant truncate on table "public"."annotations" to "anon";

grant update on table "public"."annotations" to "anon";

grant delete on table "public"."annotations" to "authenticated";

grant insert on table "public"."annotations" to "authenticated";

grant references on table "public"."annotations" to "authenticated";

grant select on table "public"."annotations" to "authenticated";

grant trigger on table "public"."annotations" to "authenticated";

grant truncate on table "public"."annotations" to "authenticated";

grant update on table "public"."annotations" to "authenticated";

grant delete on table "public"."annotations" to "service_role";

grant insert on table "public"."annotations" to "service_role";

grant references on table "public"."annotations" to "service_role";

grant select on table "public"."annotations" to "service_role";

grant trigger on table "public"."annotations" to "service_role";

grant truncate on table "public"."annotations" to "service_role";

grant update on table "public"."annotations" to "service_role";


