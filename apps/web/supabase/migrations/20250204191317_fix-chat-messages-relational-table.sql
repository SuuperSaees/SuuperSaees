drop policy "delete_chat_messages" on "public"."chat_messages";

drop policy "select_chat_messages" on "public"."chat_messages";

alter table "public"."chat_messages" drop constraint "chat_messages_account_id_fkey";

alter table "public"."chat_messages" drop column "account_id";

alter table "public"."chat_messages" drop column "content";

alter table "public"."chat_messages" drop column "role";

alter table "public"."chat_messages" add column "message_id" uuid not null;

alter table "public"."chat_messages" add constraint "chat_messages_message_id_fkey" FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_message_id_fkey";