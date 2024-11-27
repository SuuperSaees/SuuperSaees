alter table "public"."billing_accounts" add column "namespace" text not null default 'production'::text;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_primary_owner_user_id(account_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    primary_owner_user_id uuid;
BEGIN
    SELECT primary_owner_user_id 
    INTO primary_owner_user_id
    FROM accounts 
    WHERE id = account_id;
    RETURN primary_owner_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.send_billing_account_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    primary_owner_user_id uuid;
    payload text;
BEGIN
    SELECT primary_owner_user_id 
    INTO primary_owner_user_id
    FROM accounts 
    WHERE id = NEW.account_id;

    payload := '{"primary_owner_user_id": "' || primary_owner_user_id || '", "event_type": "' || TG_OP || '", "table": "' || TG_TABLE_NAME || '"}';

    PERFORM supabase_functions.http_request(
        'http://host.docker.internal:3000/api/db/webhook',
        'POST',
        '{"Content-Type":"application/json", "X-Webhook-Secret":"WEBHOOKSECRET"}',
        payload,
        '5000'
    );

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.send_billing_service_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    payload text;
BEGIN
    payload := '{"service_id": "' || NEW.id || '", "event_type": "' || TG_OP || '", "table": "' || TG_TABLE_NAME || '"}';

    PERFORM supabase_functions.http_request(
        'http://host.docker.internal:3000/api/db/webhook',
        'POST',
        '{"Content-Type":"application/json", "X-Webhook-Secret":"WEBHOOKSECRET"}',
        payload,
        '5000'
    );

    RETURN NEW;
END;
$function$
;

CREATE TRIGGER billing_accounts_webhook AFTER INSERT OR UPDATE ON public.billing_accounts FOR EACH ROW EXECUTE FUNCTION send_billing_account_webhook();

CREATE TRIGGER billing_services_webhook AFTER INSERT OR UPDATE ON public.billing_services FOR EACH ROW EXECUTE FUNCTION send_billing_service_webhook();
