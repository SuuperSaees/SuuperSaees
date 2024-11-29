set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_account_name_changes(
    p_account_id uuid,
    p_name text,
    p_is_personal_accounts boolean,
    p_old_name text  
)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF p_is_personal_accounts = FALSE AND p_old_name <> p_name THEN
        UPDATE organization_settings 
        SET value = p_name::text,
            updated_at = NOW()
        WHERE account_id = p_account_id 
        AND key = 'portal_name'::organization_setting_key;
        
        IF NOT FOUND THEN
            INSERT INTO organization_settings 
                (account_id, key, value, created_at, updated_at)
            VALUES 
                (p_account_id, 'portal_name'::organization_setting_key, p_name::text, NOW(), NOW());
        END IF;
    END IF;
    RETURN 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_organization_settings_portal_name_changes(
    p_account_id uuid,
    p_key organization_setting_key,
    p_value text,
    p_old_value text 
)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF p_key = 'portal_name'::organization_setting_key AND p_old_value <> p_value THEN
        UPDATE accounts 
        SET name = p_value 
        WHERE id = p_account_id;
    END IF;
    RETURN 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_after_accounts_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM handle_account_name_changes(NEW.id, NEW.name, NEW.is_personal_account, OLD.name);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_after_organization_settings_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM handle_organization_settings_portal_name_changes(NEW.account_id, NEW.key, NEW.value, OLD.value);
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS after_insert_accounts ON public.accounts;
DROP TRIGGER IF EXISTS after_update_accounts ON public.accounts;
DROP TRIGGER IF EXISTS after_update_organization_settings ON public.organization_settings;

CREATE TRIGGER after_update_accounts 
    AFTER UPDATE ON public.accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_after_accounts_changes();

CREATE TRIGGER after_update_organization_settings 
    AFTER UPDATE ON public.organization_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION trigger_after_organization_settings_changes();


GRANT EXECUTE ON FUNCTION public.trigger_after_accounts_changes() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.trigger_after_organization_settings_changes() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.handle_account_name_changes(uuid, text, boolean, text) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.handle_organization_settings_portal_name_changes(uuid, organization_setting_key, text, text) TO authenticated, anon, service_role;