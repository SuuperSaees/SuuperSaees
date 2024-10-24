set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decrement_service_client_count()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if the client-service relationship exists
    IF EXISTS (
        SELECT 1 
        FROM public.client_services 
        WHERE client_organization_id = OLD.client_organization_id
        AND service_id = OLD.service_id
    ) THEN
        -- Check if this is the last subscription for the client for this service
        IF (SELECT COUNT(*) FROM public.client_services 
            WHERE client_organization_id = OLD.client_organization_id
            AND service_id = OLD.service_id) = 1 THEN
            -- Decrement the number_of_clients in the services table only if it's greater than 0
            UPDATE public.services
            SET number_of_clients = GREATEST(number_of_clients - 1, 0)
            WHERE id = OLD.service_id;
        END IF;
    END IF;

    RETURN OLD;
END;

$function$;
CREATE OR REPLACE FUNCTION public.increment_service_client_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    -- Check if the client-service relationship already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM public.client_services 
        WHERE client_organization_id = NEW.client_organization_id
        AND service_id = NEW.service_id
    ) THEN
        -- Increment the number_of_clients in the services table
        UPDATE public.services
        SET number_of_clients = number_of_clients + 1
        WHERE id = NEW.service_id;
    END IF;

    RETURN NEW;
END;$function$
;


create trigger "on_client_service_insert"
before insert on public.client_services for each row
execute function increment_service_client_count();

create trigger "on_client_service_delete"
before delete on public.client_services for each row
execute function decrement_service_client_count();