alter table "public"."chat_members" add constraint "chat_members_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) not valid;

alter table "public"."chat_members" validate constraint "chat_members_chat_id_fkey";

alter table "public"."chat_members" add constraint "chat_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) not valid;

alter table "public"."chat_members" validate constraint "chat_members_user_id_fkey";