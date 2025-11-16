set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_agency_client(_agency_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if the user is associated with the client in the clients table
  RETURN EXISTS (
    SELECT 1
    FROM clients
    WHERE agency_id = _agency_id
  );
END;
$function$
;

GRANT EXECUTE ON FUNCTION is_agency_client(UUID) TO authenticated, service_role