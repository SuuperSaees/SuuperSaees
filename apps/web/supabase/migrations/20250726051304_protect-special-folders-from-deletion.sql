-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS before_folder_delete ON public.folders;

-- Create or replace the function to handle both INSERT and DELETE operations
CREATE OR REPLACE FUNCTION public.enforce_folder_constraints()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  existing_count INTEGER;
BEGIN
  -- Handle DELETE operations first
  IF TG_OP = 'DELETE' THEN
    -- Prevent deletion of special folders (like "Projects")
    IF OLD.name = 'Projects' AND OLD.is_subfolder = TRUE THEN
      RAISE EXCEPTION 'The "Projects" folder cannot be deleted as it is a special system folder';
    END IF;
    RETURN OLD;
  END IF;

  -- Handle INSERT operations (existing logic)
  -- Check for duplicate root folders (for the same organization)
  IF NEW.is_subfolder = FALSE AND NEW.parent_folder_id IS NULL THEN
    -- Count existing root folders with the same agency_id and client_organization_id
    SELECT COUNT(*) INTO existing_count
    FROM folders
    WHERE is_subfolder = FALSE 
      AND parent_folder_id IS NULL
      AND agency_id = NEW.agency_id
      AND (
        (NEW.client_organization_id IS NULL AND client_organization_id IS NULL) OR
        (NEW.client_organization_id IS NOT NULL AND client_organization_id = NEW.client_organization_id)
      );
      
    -- If a root folder already exists for this organization, raise an exception
    IF existing_count > 0 AND TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'A root folder already exists for this organization';
    END IF;
  END IF;
  
  -- Check for duplicate special subfolders (like "Projects")
  IF NEW.is_subfolder = TRUE AND NEW.parent_folder_id IS NOT NULL AND NEW.name = 'Projects' THEN
    -- Count existing "Projects" folders with the same agency_id and client_organization_id
    SELECT COUNT(*) INTO existing_count
    FROM folders
    WHERE name = 'Projects'
      AND is_subfolder = TRUE
      AND agency_id = NEW.agency_id
      AND (
        (NEW.client_organization_id IS NULL AND client_organization_id IS NULL) OR
        (NEW.client_organization_id IS NOT NULL AND client_organization_id = NEW.client_organization_id)
      );
      
    -- If a "Projects" folder already exists for this agency-client combination, raise an exception
    IF existing_count > 0 AND TG_OP = 'INSERT' THEN
      RAISE EXCEPTION 'A "Projects" folder already exists for this agency-client combination';
    END IF;
  END IF;
  
  -- All checks passed, allow the operation
  RETURN NEW;
END;
$function$;

-- Add new trigger for DELETE operations
CREATE TRIGGER before_folder_delete
  BEFORE DELETE ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION enforce_folder_constraints();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.enforce_folder_constraints() TO authenticated, service_role; 