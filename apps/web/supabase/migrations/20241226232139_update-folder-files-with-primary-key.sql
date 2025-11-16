alter table "public"."folder_files" drop constraint "folder_files_pkey";

drop index if exists "public"."folder_files_pkey";

alter table "public"."folder_files" alter column "file_id" set not null;

alter table "public"."folder_files" alter column "folder_id" set not null;

CREATE UNIQUE INDEX folder_files_pkey ON public.folder_files USING btree (file_id, id, folder_id);

alter table "public"."folder_files" add constraint "folder_files_pkey" PRIMARY KEY using index "folder_files_pkey";



