create table "public"."folder_files" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "file_id" uuid,
    "folder_id" uuid,
    "agency_id" text,
    "client_organization_id" text
);


alter table "public"."folder_files" enable row level security;

create table "public"."folders" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "agency_id" text not null,
    "client_organization_id" text not null,
    "is_subfolder" boolean default false,
    "parent_folder_id" uuid
);


alter table "public"."folders" enable row level security;

CREATE UNIQUE INDEX folder_files_pkey ON public.folder_files USING btree (id);

CREATE UNIQUE INDEX folders_pkey ON public.folders USING btree (id);

alter table "public"."folder_files" add constraint "folder_files_pkey" PRIMARY KEY using index "folder_files_pkey";

alter table "public"."folders" add constraint "folders_pkey" PRIMARY KEY using index "folders_pkey";

alter table "public"."folder_files" add constraint "folder_files_file_id_fkey" FOREIGN KEY (file_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folder_files" validate constraint "folder_files_file_id_fkey";

alter table "public"."folder_files" add constraint "folder_files_folder_id_fkey" FOREIGN KEY (folder_id) REFERENCES folders(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folder_files" validate constraint "folder_files_folder_id_fkey";

alter table "public"."folders" add constraint "folders_parent_folder_id_fkey" FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."folders" validate constraint "folders_parent_folder_id_fkey";

grant delete on table "public"."folder_files" to "anon";

grant insert on table "public"."folder_files" to "anon";

grant references on table "public"."folder_files" to "anon";

grant select on table "public"."folder_files" to "anon";

grant trigger on table "public"."folder_files" to "anon";

grant truncate on table "public"."folder_files" to "anon";

grant update on table "public"."folder_files" to "anon";

grant delete on table "public"."folder_files" to "authenticated";

grant insert on table "public"."folder_files" to "authenticated";

grant references on table "public"."folder_files" to "authenticated";

grant select on table "public"."folder_files" to "authenticated";

grant trigger on table "public"."folder_files" to "authenticated";

grant truncate on table "public"."folder_files" to "authenticated";

grant update on table "public"."folder_files" to "authenticated";

grant delete on table "public"."folder_files" to "service_role";

grant insert on table "public"."folder_files" to "service_role";

grant references on table "public"."folder_files" to "service_role";

grant select on table "public"."folder_files" to "service_role";

grant trigger on table "public"."folder_files" to "service_role";

grant truncate on table "public"."folder_files" to "service_role";

grant update on table "public"."folder_files" to "service_role";

grant delete on table "public"."folders" to "anon";

grant insert on table "public"."folders" to "anon";

grant references on table "public"."folders" to "anon";

grant select on table "public"."folders" to "anon";

grant trigger on table "public"."folders" to "anon";

grant truncate on table "public"."folders" to "anon";

grant update on table "public"."folders" to "anon";

grant delete on table "public"."folders" to "authenticated";

grant insert on table "public"."folders" to "authenticated";

grant references on table "public"."folders" to "authenticated";

grant select on table "public"."folders" to "authenticated";

grant trigger on table "public"."folders" to "authenticated";

grant truncate on table "public"."folders" to "authenticated";

grant update on table "public"."folders" to "authenticated";

grant delete on table "public"."folders" to "service_role";

grant insert on table "public"."folders" to "service_role";

grant references on table "public"."folders" to "service_role";

grant select on table "public"."folders" to "service_role";

grant trigger on table "public"."folders" to "service_role";

grant truncate on table "public"."folders" to "service_role";

grant update on table "public"."folders" to "service_role";

create policy "Allow_All"
on "public"."folder_files"
as permissive
for all
to authenticated
using (true);


create policy "allow_all"
on "public"."folders"
as permissive
for all
to authenticated
using (true);


create policy "get_folders"
on "public"."folders"
as permissive
for select
to authenticated
using (true);


create policy "insert_folders"
on "public"."folders"
as permissive
for insert
to authenticated
with check (true);

