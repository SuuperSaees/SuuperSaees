set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_default_agency_statuses()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Only proceed if the new account is not personal
    IF NEW.is_personal_account = FALSE THEN
        INSERT INTO agency_statuses (status_name, status_color, agency_id, position)
        VALUES 
            ('Pending response', '#fef7c3', NEW.id, 0),
            ('In progress', '#f4ebff', NEW.id, 1),
            ('Completed', '#dcfae6', NEW.id, 2),
            ('In review', '#fef0c7', NEW.id, 3),
            ('Cancelled', '#fee4e2', NEW.id, 4);
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER after_account_insert_default_agency_statuses AFTER INSERT ON public.accounts FOR EACH ROW EXECUTE FUNCTION insert_default_agency_statuses();

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.insert_default_agency_statuses() TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_default_agency_statuses() TO anon;
GRANT EXECUTE ON FUNCTION public.insert_default_agency_statuses() TO service_role;