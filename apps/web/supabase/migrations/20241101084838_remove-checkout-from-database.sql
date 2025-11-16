set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_checkout_if_deleted_on_not_null()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.deleted_on IS NOT NULL THEN
        DELETE FROM public.checkouts WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER after_update_checkouts_deleted_on AFTER UPDATE OF deleted_on ON public.checkouts FOR EACH ROW WHEN ((old.deleted_on IS DISTINCT FROM new.deleted_on)) EXECUTE FUNCTION delete_checkout_if_deleted_on_not_null();