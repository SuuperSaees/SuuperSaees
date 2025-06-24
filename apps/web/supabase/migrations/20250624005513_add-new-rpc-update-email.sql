CREATE OR REPLACE FUNCTION public.update_email(user_id uuid, new_email text, p_domain text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    old_email text;
BEGIN
    -- Verify that user_id is provided
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    -- Verify that new_email is provided and not empty
    IF new_email IS NULL OR new_email = '' THEN
        RAISE EXCEPTION 'New email cannot be null or empty';
    END IF;

    -- Verify that p_domain is provided and not empty
    IF p_domain IS NULL OR p_domain = '' THEN
        RAISE EXCEPTION 'Domain cannot be null or empty';
    END IF;
    
    -- Get the current email from auth.users
    SELECT email INTO old_email
    FROM auth.users
    WHERE id = user_id;
    
    -- Verify that the user exists
    IF old_email IS NULL THEN
        RAISE EXCEPTION 'User not found with ID: %', user_id;
    END IF;
    
    -- Verify that the new email is different from the current one
    IF old_email = new_email THEN
        RAISE EXCEPTION 'New email is the same as current email';
    END IF;
    
    -- Update email in auth.users
    UPDATE auth.users
    SET 
        email = new_email,
        updated_at = now()
    WHERE id = user_id;
    
    -- Verify that the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update email in auth.users for user ID: %', user_id;
    END IF;
    
    -- Update email in public.accounts
    UPDATE public.accounts
    SET 
        email = new_email,
        updated_at = now()
    WHERE id = user_id;
    
    -- Verify that the update was successful in accounts
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update email in accounts for user ID: %', user_id;
    END IF;
    
    -- Update email in auth.user_credentials for all domains
    UPDATE auth.user_credentials
    SET 
        email = new_email,
        updated_at = now()
    WHERE email = old_email AND domain = p_domain;
    
    -- Log the operation (optional)
    RAISE NOTICE 'Email successfully updated from % to % for user ID: %', old_email, new_email, user_id;
    
END;
$function$
;