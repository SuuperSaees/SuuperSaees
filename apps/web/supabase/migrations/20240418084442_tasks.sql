-- insert new permissions
alter type public.app_permissions add value 'tasks.write';
alter type public.app_permissions add value 'tasks.delete';
commit;

-- create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title varchar(500) not null,
  description varchar(50000),
  done boolean not null default false,
  account_id uuid not null references public.accounts(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- create tasks policies
grant select, insert, update, delete on table public.tasks to
    authenticated, service_role;

-- indexes
create index ix_tasks_account_id on public.tasks(account_id);

-- enable row level security
alter table tasks enable row level security;

-- SELECT(tasks)
create policy select_tasks on public.tasks
    for select
    to authenticated
    using ((
        account_id = (select auth.uid())) or
        public.has_role_on_account(account_id)
    );

-- INSERT(tasks)
create policy insert_tasks on public.tasks
    for insert
    with check (
        (account_id = (select auth.uid())) or
        public.has_permission((select auth.uid()), account_id, 'tasks.write'::app_permissions)
    );

-- UPDATE(tasks)
create policy update_tasks on public.tasks
    for update
    using (
        (account_id = (select auth.uid())) or
        public.has_permission((select auth.uid()), account_id, 'tasks.write'::app_permissions)
    );

-- DELETE(tasks)
create policy delete_tasks on public.tasks
    for delete
    using (
        (account_id = (select auth.uid())) or
        public.has_permission((select auth.uid()), account_id, 'tasks.delete'::app_permissions)
    );