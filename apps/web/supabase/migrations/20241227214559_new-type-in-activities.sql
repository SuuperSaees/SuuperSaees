alter type "public"."activity_type" rename to "activity_type__old_version_to_be_dropped";

create type "public"."activity_type" as enum ('message', 'review', 'status', 'priority', 'assign', 'due_date', 'description', 'title', 'assigned_to', 'task', 'annotation');

alter table "public"."activities" alter column type type "public"."activity_type" using type::text::"public"."activity_type";

drop type "public"."activity_type__old_version_to_be_dropped";
