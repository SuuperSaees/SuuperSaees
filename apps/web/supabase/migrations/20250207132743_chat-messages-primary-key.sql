alter table "public"."chat_messages" drop constraint "chat_messages_pkey";

drop index if exists "public"."chat_messages_pkey";

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id, chat_id, message_id);

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";