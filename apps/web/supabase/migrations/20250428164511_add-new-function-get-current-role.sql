set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_current_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_org_id uuid;
    v_role text;
    v_user_id uuid;
BEGIN
    -- Get the current user ID
    SELECT auth.uid() INTO v_user_id;

    -- Get only the organization_id from the current session
    SELECT get_current_organization_id() INTO v_org_id;

    -- If organization_id is null, return an empty string
    IF v_org_id IS NULL THEN
        RETURN '';
    END IF;

    -- Return the role
    SELECT account_role INTO v_role
    FROM public.accounts_memberships
    WHERE user_id = v_user_id AND organization_id = v_org_id;

    RETURN v_role;
END;
$function$
;

grant execute on function get_current_role() to authenticated, service_role;

-- Function for the trigger
CREATE OR REPLACE FUNCTION update_user_metadata_on_client_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_subdomain_id uuid;
  v_domain text;
  v_metadata jsonb;
BEGIN
  -- Only if deleted_on is not null
  IF NEW.deleted_on IS NOT NULL THEN
    -- Search for subdomain_id
    SELECT subdomain_id INTO v_subdomain_id
    FROM organization_subdomains
    WHERE organization_id = NEW.agency_id
    LIMIT 1;

    -- Search for domain
    SELECT domain INTO v_domain
    FROM subdomains
    WHERE id = v_subdomain_id
    LIMIT 1;

    -- Get the current metadata
    SELECT raw_app_meta_data INTO v_metadata
    FROM auth.users
    WHERE id = NEW.user_client_id;

    -- If there is no metadata, use the default value
    IF v_metadata IS NULL THEN
      v_metadata := '{"provider": "email", "providers": ["email"]}'::jsonb;
    END IF;

    -- Update/add the subdomain with the deleted_on object
    v_metadata := jsonb_set(
      v_metadata,
      ARRAY[v_domain],
      COALESCE(
        (v_metadata -> v_domain) || jsonb_build_object('deleted_on', NEW.deleted_on),
        jsonb_build_object('deleted_on', NEW.deleted_on)
      ),
      true
    );

    -- Update the user
    UPDATE auth.users
    SET raw_app_meta_data = v_metadata
    WHERE id = NEW.user_client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

grant execute on function update_user_metadata_on_client_delete() to authenticated, service_role;

drop trigger if exists trg_update_user_metadata_on_client_delete on clients;

-- Trigger
CREATE TRIGGER trg_update_user_metadata_on_client_delete
AFTER UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_user_metadata_on_client_delete();

-- Function for the trigger
CREATE OR REPLACE FUNCTION update_user_phone_on_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only if the phone_number changed
  IF NEW.phone_number IS DISTINCT FROM OLD.phone_number THEN
    UPDATE auth.users
    SET phone = NEW.phone_number
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

grant execute on function update_user_phone_on_user_settings() to authenticated, service_role;

drop trigger if exists trg_update_user_phone_on_user_settings on user_settings;

-- Trigger
CREATE TRIGGER trg_update_user_phone_on_user_settings
AFTER UPDATE OF phone_number ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_user_phone_on_user_settings();