
alter table "public"."chat_members" drop constraint "chat_members_pkey";

drop index if exists "public"."chat_members_pkey";

alter table "public"."messages" add column "chat_id" uuid;

CREATE UNIQUE INDEX chat_members_pkey ON public.chat_members USING btree (user_id, id, chat_id);

alter table "public"."chat_members" add constraint "chat_members_pkey" PRIMARY KEY using index "chat_members_pkey";

alter table "public"."messages" add constraint "messages_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_chat_id_fkey";




