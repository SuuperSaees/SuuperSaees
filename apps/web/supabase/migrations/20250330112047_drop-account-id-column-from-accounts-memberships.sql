alter table "public"."accounts_memberships" drop constraint "accounts_memberships_account_id_fkey1";

alter table "public"."accounts_memberships" drop constraint "accounts_memberships_pkey";

drop index if exists "public"."accounts_memberships_pkey";

drop index if exists "public"."ix_accounts_memberships_account_id";

alter table "public"."accounts_memberships" drop column "account_id" cascade;

alter table "public"."credits_usage" drop column "account_id" cascade;
