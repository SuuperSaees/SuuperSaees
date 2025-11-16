alter table "public"."orders_v2" alter column "status" set default 'pending'::text;

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
            ('pending', '#fef7c3', NEW.id, 0),
            ('in_progress', '#f4ebff', NEW.id, 1),
            ('completed', '#dcfae6', NEW.id, 2),
            ('in_review', '#fef0c7', NEW.id, 3),
            ('anulled', '#fee4e2', NEW.id, 4);
    END IF;
    RETURN NEW;
END;
$function$
;


