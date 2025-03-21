alter table "public"."account_plugins" alter column "provider_id" drop not null;

alter table "public"."account_plugins" alter column "provider_id" set data type text using "provider_id"::text;

alter table "public"."billing_accounts" alter column "provider_id" drop not null;



