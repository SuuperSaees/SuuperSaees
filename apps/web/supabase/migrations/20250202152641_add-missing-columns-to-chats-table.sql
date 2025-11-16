alter table "public"."chats" drop constraint "chats_account_id_fkey";

drop index if exists "public"."ix_chats_account_id";

alter table "public"."chats" drop column "account_id";

alter table "public"."chats" add column "deleted_on" timestamp with time zone;

alter table "public"."chats" add column "image" text;

alter table "public"."chats" add column "updated_at" timestamp with time zone;

alter table "public"."chats" add column "user_id" uuid not null;

alter table "public"."chats" alter column "reference_id" drop not null;

alter table "public"."chats" add column "visibility" boolean not null default true;

CREATE INDEX ix_chats_account_id ON public.chats USING btree (user_id);

alter table "public"."chats" add constraint "chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_user_id_fkey";