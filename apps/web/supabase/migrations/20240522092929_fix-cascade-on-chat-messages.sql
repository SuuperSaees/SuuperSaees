alter table public.chat_messages
drop constraint if exists chat_messages_account_id_fkey,
add constraint chat_messages_account_id_fkey
foreign key (account_id) references public.accounts(id) on delete cascade;
