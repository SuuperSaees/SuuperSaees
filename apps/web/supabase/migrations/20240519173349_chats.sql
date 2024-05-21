-- public.chat_sender definition
create type public.chat_role as enum ('user', 'assistant');

-- public.chats definition
create table if not exists public.chats (
    id serial primary key,
    reference_id varchar(8) not null unique,
    name varchar(255) not null,
    account_id uuid not null references public.accounts(id) on delete cascade,
    settings jsonb not null default '{}',
    created_at timestamp with time zone default now()
);

-- index
create index ix_chats_account_id on public.chats(account_id);

-- public.chats row level security
alter table public.chats enable row level security;

-- public.has_credits
create or replace function public.has_credits(account_id uuid) returns boolean as $$
   select remaining_credits > 0 from public.credits_usage where public.credits_usage.account_id = $1;
$$ language sql stable;

grant execute on function public.has_credits(uuid) to authenticated, service_role;

-- SELECT(public.chats)
create policy select_chats on public.chats
 for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
 );

-- INSERT(public.chats)
create policy insert_chats on public.chats
 for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id) and
    public.has_credits(account_id)
 );

-- UPDATE(public.chats)
create policy update_chats on public.chats
 for update
   to authenticated
   using (
    public.has_role_on_account(account_id)
 );

-- DELETE(public.chats)
create policy delete_chats on public.chats
 for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
 );

-- public.chat_messages
create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    chat_id serial not null references public.chats(id) on delete cascade,
    account_id uuid not null references public.accounts(id),
    content text not null,
    role chat_role not null,
    created_at timestamp with time zone default now()
);

-- public.chat_messages row level security
alter table public.chat_messages enable row level security;

create index ix_chat_messages_chat_id on public.chat_messages(chat_id);

-- SELECT(public.chat_messages)
create policy select_chat_messages on public.chat_messages
 for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
 );

-- DELETE(public.chat_messages)
create policy delete_chat_messages on public.chat_messages
 for delete
   to authenticated
   using (
    public.has_role_on_account(account_id)
 );

-- public.credits_usage
create table if not exists public.credits_usage (
    id serial primary key,
    account_id uuid not null references public.accounts(id) on delete cascade,
    remaining_credits integer not null default 0
);

-- RLS
alter table public.credits_usage enable row level security;

-- SELECT(public.credits_usage)
create policy select_credits_usage on public.credits_usage
 for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
 );

-- public.plans
create table if not exists public.plans (
    variant_id varchar(255) primary key,
    name varchar(255) not null,
    tokens_quota integer not null
);

-- RLS
alter table public.plans enable row level security;

-- SELECT(public.plans)
create policy select_plans on public.plans
 for select
  to authenticated
  using (true);

-- insert usage row for accounts on creation
-- we insert 50000 credits for each new account for free
create function kit.handle_new_account_credits_usage()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  accounts_count integer;
begin
  -- collect the number of accounts the user has
  select count (*) from public.accounts
  where public.accounts.primary_owner_user_id = new.primary_owner_user_id
  and public.accounts.is_personal_account = false
  into accounts_count;

  -- we add credits only when this is the 1st account
  -- to avoid abuse of the free credits
  if accounts_count > 1 then
    insert into public.credits_usage (account_id, remaining_credits)
      values (new.id, 0);

    return new;
  end if;

  -- since this is the first account, we add 20000 credits
  insert into public.credits_usage (account_id, remaining_credits)
  values (new.id, 20000);
  return new;
end;
$$;

-- trigger the function every time an account is created
create trigger on_account_created_fill_credits
  after insert on public.accounts
  for each row
  when (new.is_personal_account = false)
  execute procedure kit.handle_new_account_credits_usage();

-- Function to deduct credits from an account
-- can only be called by the service role
create or replace function public.deduct_credits(account_id uuid, amount integer)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.credits_usage
  set remaining_credits = remaining_credits - amount
  where public.credits_usage.account_id = $1;
end;
$$;

grant execute on function public.deduct_credits(uuid, integer) to service_role;
