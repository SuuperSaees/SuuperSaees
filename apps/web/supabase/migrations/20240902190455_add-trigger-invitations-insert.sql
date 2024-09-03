-- CREATE TRIGGER invitations_insert AFTER INSERT ON public.invitations FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:3000/api/db/webhook', 'POST', '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}', '{}', '5000');

alter table "public"."accounts" alter column "stripe_id" drop default;

alter table "public"."accounts" alter column "stripe_id" drop not null;