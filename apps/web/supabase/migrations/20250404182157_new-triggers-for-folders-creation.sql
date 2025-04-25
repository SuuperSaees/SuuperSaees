drop trigger if exists "after_update_accounts" on "public"."accounts";

drop trigger if exists "after_update_organization_settings" on "public"."organization_settings";

alter table "public"."folders" alter column "client_organization_id" drop not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enforce_folder_constraints()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  existing_count INTEGER;
BEGIN
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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_insert_operations_with_folders()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  root_folder_id UUID;
  projects_folder_id UUID;
  is_client BOOLEAN;
BEGIN
  -- Case: Insert into orders_v2
  IF TG_TABLE_NAME = 'orders_v2' THEN
    SELECT id INTO projects_folder_id
    FROM folders
    WHERE name = 'Projects'
      AND agency_id = NEW.agency_id
      AND client_organization_id = NEW.client_organization_id;
    
    INSERT INTO folders (id, name, agency_id, client_organization_id, is_subfolder, parent_folder_id)
    VALUES (NEW.uuid::uuid, NEW.title, NEW.agency_id, NEW.client_organization_id, true, projects_folder_id);
  END IF;
  
  -- Case: Insert into accounts (Agency or Client Organization)
  IF TG_TABLE_NAME = 'organizations' THEN
      -- Check if this account is already linked as a client to an agency
      SELECT EXISTS (
        SELECT 1 FROM clients 
        WHERE organization_client_id = NEW.id
      ) INTO is_client;
      
      -- Only create folders if this is not a client account
      -- For client accounts, the folders will be created by the clients trigger
      IF NOT is_client THEN
        -- Find existing root folder for the agency
        SELECT id INTO root_folder_id
        FROM folders
        WHERE name = NEW.name
          AND agency_id = NEW.id
          AND is_subfolder = false
          AND parent_folder_id IS NULL
        LIMIT 1;
        
        -- If no root folder exists, create it
        IF root_folder_id IS NULL THEN
          INSERT INTO folders (name, agency_id, client_organization_id, is_subfolder, parent_folder_id)
          VALUES (NEW.name, NEW.id, NEW.id, false, NULL)
          RETURNING id INTO root_folder_id;
        END IF;
        
        -- Find existing "Projects" folder
        SELECT id INTO projects_folder_id
        FROM folders
        WHERE name = 'Projects'
          AND agency_id = NEW.id
          AND is_subfolder = true
          AND parent_folder_id = root_folder_id
        LIMIT 1;
        
        -- If no "Projects" folder exists, create it
        IF projects_folder_id IS NULL THEN
          INSERT INTO folders (name, agency_id, client_organization_id, is_subfolder, parent_folder_id)
          VALUES ('Projects', NEW.id, NEW.id, true, root_folder_id);
        END IF;
      END IF;
  END IF;
  
  -- Case: Insert into clients (Client Organizations)
  IF TG_TABLE_NAME = 'clients' THEN
    -- Get the root folder for the client organization
    SELECT id INTO root_folder_id
    FROM folders
    WHERE name = (SELECT name FROM organizations WHERE id = NEW.organization_client_id)
      AND is_subfolder = false
      AND parent_folder_id IS NULL
    LIMIT 1;
    
    -- Create client root folder if it doesn't exist
    IF root_folder_id IS NULL THEN
      INSERT INTO folders (name, agency_id, client_organization_id, is_subfolder, parent_folder_id)
      VALUES (
        (SELECT name FROM organizations WHERE id = NEW.organization_client_id),
        NEW.agency_id,
        NEW.organization_client_id,
        false,
        NULL
      )
      RETURNING id INTO root_folder_id;
    ELSE
      -- Update existing root folder to set the correct agency_id and client_organization_id
      UPDATE folders
      SET 
        agency_id = NEW.agency_id,
        client_organization_id = NEW.organization_client_id
      WHERE id = root_folder_id;
    END IF;
    
    -- Get the "Projects" folder under this root folder
    SELECT id INTO projects_folder_id
    FROM folders
    WHERE name = 'Projects'
      AND parent_folder_id = root_folder_id
    LIMIT 1;
    
    -- Create Projects folder if it doesn't exist
    IF projects_folder_id IS NULL THEN
      INSERT INTO folders (name, agency_id, client_organization_id, is_subfolder, parent_folder_id)
      VALUES (
        'Projects',
        NEW.agency_id,
        NEW.organization_client_id,
        true,
        root_folder_id
      );
    ELSE
      -- Update existing Projects folder to set the correct agency_id and client_organization_id
      UPDATE folders
      SET 
        agency_id = NEW.agency_id,
        client_organization_id = NEW.organization_client_id
      WHERE id = projects_folder_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$function$
;

drop trigger if exists "after_insert_accounts" on "public"."organizations";

drop trigger if exists "after_insert_clients" on "public"."clients";

drop trigger if exists "after_insert_orders_v2" on "public"."orders_v2";

drop trigger if exists "before_folder_changes" on "public"."folders";

CREATE TRIGGER after_insert_accounts AFTER INSERT ON public.organizations FOR EACH ROW EXECUTE FUNCTION handle_insert_operations_with_folders();

CREATE TRIGGER after_insert_clients AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION handle_insert_operations_with_folders();

CREATE TRIGGER after_insert_orders_v2 AFTER INSERT ON public.orders_v2 FOR EACH ROW EXECUTE FUNCTION handle_insert_operations_with_folders();

CREATE TRIGGER before_folder_changes BEFORE INSERT ON public.folders FOR EACH ROW EXECUTE FUNCTION enforce_folder_constraints();

GRANT EXECUTE ON FUNCTION handle_insert_operations_with_folders() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_unread_message_counts(p_user_id uuid)
 RETURNS TABLE(chat_id uuid, chat_unread_count bigint, order_id integer, order_unread_count bigint)
 LANGUAGE plpgsql
AS $function$
DECLARE
  is_agency_role boolean;
  v_org_id uuid;
  cutoff_date timestamp with time zone := '2025-03-11 18:04:00-05'::timestamp with time zone; -- March 11, 2025, 6:04 PM Colombia time (UTC-5)
BEGIN
  -- Get the organization ID from the session
  SELECT get_current_organization_id() INTO v_org_id;
  
  -- Check if the user has any agency role within the current organization
  SELECT EXISTS (
    SELECT 1 
    FROM accounts_memberships am
    WHERE am.user_id = p_user_id 
    AND am.organization_id = v_org_id
    AND am.account_role IN ('agency_owner', 'agency_member', 'agency_project_manager')
  ) INTO is_agency_role;

  -- First, return chat counts
  RETURN QUERY
  SELECT 
    m.chat_id, 
    COUNT(m.id)::BIGINT AS chat_unread_count,
    NULL::integer AS order_id,
    0::BIGINT AS order_unread_count
  FROM messages m
  JOIN chats c ON m.chat_id = c.id  -- Join with chats to ensure chat exists
  LEFT JOIN message_reads mr ON 
    mr.user_id = p_user_id AND 
    mr.chat_id = m.chat_id
  WHERE 
    m.chat_id IS NOT NULL
    AND m.order_id IS NULL  -- Exclude order-related messages
    AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
    AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
    AND (
      is_agency_role = true  -- Agency roles can see all messages
      OR m.visibility = 'public'  -- Non-agency roles can only see public messages
    )
    AND (
      mr.read_at IS NULL OR 
      m.created_at > mr.read_at
    )
  GROUP BY m.chat_id;
  
-- Then, return order counts
  RETURN QUERY
  SELECT 
    NULL::uuid AS chat_id,
    0::BIGINT AS chat_unread_count,
    m.order_id::integer,
    COUNT(m.id)::BIGINT AS order_unread_count
  FROM messages m
  LEFT JOIN message_reads mr ON 
    mr.user_id = p_user_id AND 
    mr.order_id = m.order_id::integer  -- Explicit conversion to integer
  WHERE 
    m.order_id IS NOT NULL
    AND m.user_id != p_user_id  -- Exclude messages sent by the user themselves
    AND m.created_at >= cutoff_date  -- Only count messages created after the cutoff date
    AND (
      is_agency_role = true  -- Agency roles can see all messages
      OR m.visibility = 'public'  -- Non-agency roles can only see public messages
    )
    AND (
      mr.read_at IS NULL OR 
      m.created_at > mr.read_at
    )
  GROUP BY m.order_id;
END;
$function$
;

GRANT EXECUTE ON FUNCTION get_unread_message_counts(uuid) TO anon, authenticated, service_role;