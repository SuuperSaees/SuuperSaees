set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_agency_member(p_user_id uuid, p_domain text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_current_metadata jsonb;
  v_updated_metadata jsonb;
  v_domain_metadata jsonb;
  v_current_public_data jsonb;
  v_updated_public_data jsonb;
  v_public_domain_metadata jsonb;
BEGIN
  -- Get current user metadata
  SELECT raw_app_meta_data INTO v_current_metadata
  FROM auth.users 
  WHERE id = p_user_id;
  
  -- If no metadata exists, create new structure
  IF v_current_metadata IS NULL THEN
    v_current_metadata := '{}'::jsonb;
  END IF;
  
  -- Get current domain metadata or create empty object
  v_domain_metadata := COALESCE(v_current_metadata -> p_domain, '{}'::jsonb);
  
  -- Update domain metadata to set approved = true
  v_domain_metadata := v_domain_metadata || '{"approved": true}'::jsonb;
  
  -- Update the full metadata with the new domain metadata
  v_updated_metadata := v_current_metadata || jsonb_build_object(p_domain, v_domain_metadata);
  
  -- Update the user's app_metadata
  UPDATE auth.users 
  SET 
    raw_app_meta_data = v_updated_metadata,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Check if auth update was successful
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Get current public_data from accounts table
  SELECT public_data INTO v_current_public_data
  FROM public.accounts 
  WHERE id = p_user_id;
  
  -- If no public_data exists, create new structure
  IF v_current_public_data IS NULL THEN
    v_current_public_data := '{}'::jsonb;
  END IF;
  
  -- Get current domain public_data or create empty object
  v_public_domain_metadata := COALESCE(v_current_public_data -> p_domain, '{}'::jsonb);
  
  -- Update domain public_data to set approved = true
  v_public_domain_metadata := v_public_domain_metadata || '{"approved": true}'::jsonb;
  
  -- Update the full public_data with the new domain metadata
  v_updated_public_data := v_current_public_data || jsonb_build_object(p_domain, v_public_domain_metadata);
  
  -- Update the accounts public_data
  UPDATE public.accounts 
  SET 
    public_data = v_updated_public_data,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Check if accounts update was successful
  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
  
EXCEPTION
  WHEN others THEN
    -- Log error and return false
    RAISE LOG 'Error approving agency member: %', SQLERRM;
    RETURN false;
END;
$function$
;