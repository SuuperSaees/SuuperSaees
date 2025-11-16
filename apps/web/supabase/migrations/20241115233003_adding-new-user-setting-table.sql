create table "public"."user_settings" (
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "phone_number" text,
    "picture_url" text,
    "calendar" text,
    "name" text
);


alter table "public"."user_settings" enable row level security;

alter table "public"."accounts" drop column "phone_number";

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (user_id);

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

create or replace view "public"."user_account_workspace" as  SELECT accounts.id,
    accounts.name,
    accounts.picture_url,
    ( SELECT subscriptions.status
           FROM subscriptions
          WHERE (subscriptions.propietary_organization_id = accounts.id)
         LIMIT 1) AS subscription_status
   FROM accounts
  WHERE ((accounts.primary_owner_user_id = ( SELECT auth.uid() AS uid)) AND (accounts.is_personal_account = true))
 LIMIT 1;


create or replace view "public"."user_accounts" as  SELECT account.id,
    account.name,
    account.picture_url,
    account.slug,
    membership.account_role AS role
   FROM (accounts account
     JOIN accounts_memberships membership ON ((account.id = membership.account_id)))
  WHERE ((membership.user_id = ( SELECT auth.uid() AS uid)) AND (account.is_personal_account = false) AND (account.id IN ( SELECT accounts_memberships.account_id
           FROM accounts_memberships
          WHERE (accounts_memberships.user_id = ( SELECT auth.uid() AS uid)))));


grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";


create policy "Policy with security definer functions"
on "public"."user_settings"
as permissive
for all
to authenticated
using (true);
