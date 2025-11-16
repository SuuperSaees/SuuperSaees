alter table "public"."form_fields" alter column "type" drop default;

alter type "public"."field_types" rename to "field_types__old_version_to_be_dropped";

create type "public"."field_types" as enum ('date', 'multiple_choice', 'select', 'text', 'h1', 'h2', 'h3', 'h4', 'text-short', 'text-large', 'number', 'file', 'dropdown', 'rich-text', 'image', 'video');

alter table "public"."form_fields" alter column type type "public"."field_types" using type::text::"public"."field_types";

alter table "public"."form_fields" alter column "type" set default 'text'::field_types;

drop type "public"."field_types__old_version_to_be_dropped";




