alter type "public"."action_type" rename to "action_type__old_version_to_be_dropped";

create type "public"."action_type" as enum ('create', 'update', 'delete', 'complete');

alter table "public"."activities" alter column action type "public"."action_type" using action::text::"public"."action_type";

drop type "public"."action_type__old_version_to_be_dropped";
