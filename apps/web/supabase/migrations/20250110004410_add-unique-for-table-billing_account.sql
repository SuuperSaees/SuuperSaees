CREATE UNIQUE INDEX unique_account_provider ON public.billing_accounts USING btree (account_id, provider);

alter table "public"."billing_accounts" add constraint "unique_account_provider" UNIQUE using index "unique_account_provider";




