create type "public"."messages_types" as enum ('public', 'internal_agency');

alter table "public"."messages" add column "visibility" messages_types default 'public'::messages_types;