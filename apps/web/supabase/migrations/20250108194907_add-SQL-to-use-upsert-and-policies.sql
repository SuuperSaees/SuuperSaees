CREATE UNIQUE INDEX unique_plugin_account ON public.account_plugins USING btree (plugin_id, account_id);

alter table "public"."account_plugins" add constraint "unique_plugin_account" UNIQUE using index "unique_plugin_account";


