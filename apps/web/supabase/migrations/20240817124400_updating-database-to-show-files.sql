alter table "public"."order_files" drop constraint "order_files_order_id_fkey";

alter table "public"."files" alter column "type" set data type text using "type"::text;

alter table "public"."order_files" alter column "order_id" set data type text using "order_id"::text;

CREATE UNIQUE INDEX orders_v2_uuid_key ON public.orders_v2 USING btree (uuid);

alter table "public"."orders_v2" add constraint "orders_v2_uuid_key" UNIQUE using index "orders_v2_uuid_key";

alter table "public"."order_files" add constraint "order_files_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders_v2(uuid) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."order_files" validate constraint "order_files_order_id_fkey";

CREATE TRIGGER accounts_teardown AFTER DELETE ON public.accounts FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:3000/api/db/webhook', 'POST', '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}', '{}', '5000');

CREATE TRIGGER invitations_insert AFTER INSERT ON public.invitations FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:3000/api/db/webhook', 'POST', '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}', '{}', '5000');

CREATE TRIGGER subscriptions_delete AFTER DELETE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:3000/api/db/webhook', 'POST', '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}', '{}', '5000');


