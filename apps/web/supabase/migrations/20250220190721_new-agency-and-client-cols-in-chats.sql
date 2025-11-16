
alter table "public"."chats" add column "agency_id" uuid;

alter table "public"."chats" add column "client_organization_id" uuid;


alter table "public"."chats" add constraint "chats_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES accounts(id) ON UPDATE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_agency_id_fkey";

alter table "public"."chats" add constraint "chats_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES accounts(id) ON UPDATE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_client_organization_id_fkey";

set check_function_bodies = off;



