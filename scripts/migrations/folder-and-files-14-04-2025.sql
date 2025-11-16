-- Online SQL Editor to Run SQL Online.
-- Use the editor to create new tables, insert data and all other SQL operations.

DO $$
DECLARE
    agency_folder record;
    client_folder record;
    new_root_folder_id uuid;
BEGIN
    -- === 1. Create root folders for AGENT-ONLY orgs (non-personal, not a client) ===
    FOR agency_folder IN (
        SELECT DISTINCT
            org.id AS agency_id,
            org.name AS name
        FROM organizations org
        LEFT JOIN clients cl ON org.id = cl.organization_client_id
        WHERE cl.organization_client_id IS NULL
    ) LOOP
        -- Eliminate duplicates (same name + agency + client ID)
        WITH duplicates AS (
            SELECT id,
                   ROW_NUMBER() OVER (
                       PARTITION BY name, agency_id, client_organization_id
                       ORDER BY created_at
                   ) as rn
            FROM folders
            WHERE agency_id = agency_folder.agency_id
              AND client_organization_id = agency_folder.agency_id
        )
        DELETE FROM folders
        WHERE id IN (
            SELECT id FROM duplicates WHERE rn > 1
        );

        -- Create root folder for agency (only if one doesn't already exist)
        IF NOT EXISTS (
            SELECT 1 FROM folders 
            WHERE agency_id = agency_folder.agency_id
              AND client_organization_id = agency_folder.agency_id
              AND parent_folder_id IS NULL
        ) THEN
            INSERT INTO folders (name, parent_folder_id, agency_id, client_organization_id, is_subfolder)
            VALUES (
                agency_folder.name,
                NULL,
                agency_folder.agency_id,
                agency_folder.agency_id,
                FALSE
            )
            RETURNING id INTO new_root_folder_id;

            -- Update existing folders to be subfolders of new root
            UPDATE folders
            SET 
                is_subfolder = TRUE,
                parent_folder_id = new_root_folder_id
            WHERE 
                agency_id = agency_folder.agency_id
                AND client_organization_id = agency_folder.agency_id
                AND id != new_root_folder_id
                AND parent_folder_id IS NULL;

            RAISE NOTICE 'Processed agency: %, new root folder: %', agency_folder.name, new_root_folder_id;
        END IF;
    END LOOP;

    -- === 2. Create root folders for ALL CLIENTS ===
    FOR client_folder IN (
        SELECT DISTINCT
            cl.agency_id as agency_id,
            cl.organization_client_id as client_organization_id,
            org.name as name
        FROM clients cl
        JOIN organizations org ON org.id = cl.organization_client_id
    ) LOOP
        -- Skip if root folder already exists
        IF NOT EXISTS (
            SELECT 1 FROM folders 
            WHERE agency_id = client_folder.agency_id
              AND client_organization_id = client_folder.client_organization_id
              AND parent_folder_id IS NULL
              AND name = client_folder.name
        ) THEN
            INSERT INTO folders (
                name, 
                parent_folder_id, 
                agency_id, 
                client_organization_id, 
                is_subfolder
            )
            VALUES (
                client_folder.name,
                NULL,
                client_folder.agency_id,
                client_folder.client_organization_id,
                FALSE
            )
            RETURNING id INTO new_root_folder_id;

            RAISE NOTICE 'Created root folder for client: % (%). Root ID: %',
                client_folder.name, client_folder.client_organization_id, new_root_folder_id;
        ELSE
            SELECT id INTO new_root_folder_id FROM folders
            WHERE agency_id = client_folder.agency_id
              AND client_organization_id = client_folder.client_organization_id
              AND parent_folder_id IS NULL
            LIMIT 1;
        END IF;

        -- Set all orphan folders as subfolders of the root
        UPDATE folders
        SET 
            is_subfolder = TRUE,
            parent_folder_id = new_root_folder_id
        WHERE 
            agency_id = client_folder.agency_id
            AND client_organization_id = client_folder.client_organization_id
            AND parent_folder_id IS NULL
            AND id != new_root_folder_id;
    END LOOP;

    -- === 3. Ensure "Projects" folder exists under each root ===
    INSERT INTO folders (name, parent_folder_id, agency_id, client_organization_id, is_subfolder)
    SELECT DISTINCT
        'Projects',
        root_folder.id,
        root_folder.agency_id,
        root_folder.client_organization_id,
        TRUE
    FROM folders AS root_folder
    WHERE root_folder.parent_folder_id IS NULL 
      AND root_folder.client_organization_id IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM folders f
          WHERE f.name = 'Projects'
            AND f.agency_id = root_folder.agency_id
            AND f.client_organization_id = root_folder.client_organization_id
      );

    -- === 4. Create a folder per order inside the client's "Projects" folder ===
    INSERT INTO folders (id, name, parent_folder_id, agency_id, client_organization_id, is_subfolder)
    SELECT DISTINCT
        o.uuid::uuid,
        o.title,
        pf.id,
        o.agency_id,
        o.client_organization_id,
        TRUE
    FROM folders pf
    JOIN orders_v2 o ON 
        o.agency_id = pf.agency_id AND 
        o.client_organization_id = pf.client_organization_id
    WHERE pf.name = 'Projects'
      AND NOT EXISTS (
          SELECT 1 FROM folders f
          WHERE f.name = o.title
            AND f.agency_id = o.agency_id
            AND f.client_organization_id = o.client_organization_id
            AND f.parent_folder_id = pf.id
      );
END $$;


--------------------------------------------- SECONDE SCRIPT ---------------------------------------------

-- FILES
DO $$
BEGIN

-- Move existing files to their corresponding order folder using order_files table
INSERT INTO folder_files (folder_id, file_id, agency_id, client_organization_id)
SELECT 
    folders.id AS folder_id,
    order_files.file_id AS file_id,
    orders_v2.agency_id AS agency_id,
    orders_v2.client_organization_id AS client_organization_id
FROM order_files
JOIN orders_v2
    ON order_files.order_id = orders_v2.uuid
JOIN folders
    ON folders.name = orders_v2.title
    AND folders.client_organization_id = orders_v2.client_organization_id
    AND folders.agency_id = orders_v2.agency_id;

END $$;

--------------------------------------------- THIRD SCRIPT ---------------------------------------------

-- Move files that not belongs to a folder (Need to be proved)
DO $$
DECLARE
    v_root_folder_id uuid;
    v_count integer;
BEGIN
    -- Insert into folder_files for files owned by personal account users
    WITH organization_root_folders AS (
        -- Get all root folders and their organization relationships
        SELECT DISTINCT
            id,
            agency_id,
            client_organization_id
        FROM folders
        WHERE parent_folder_id IS NULL
    ),
    unassigned_files AS (
        -- Get files that aren't in any folder yet
        SELECT f.id, f.user_id
        FROM files f
        WHERE f.message_id IS NULL -- Exclude files that are linked to messages
        AND NOT EXISTS (
            SELECT 1 
            FROM folder_files ff 
            WHERE ff.file_id = f.id
        )
    ),
    user_primary_organization AS (
        -- Get the first organization for each user from accounts_memberships
        SELECT DISTINCT ON (user_id)
            user_id,
            organization_id
        FROM accounts_memberships
        ORDER BY user_id, created_at  -- Order by created_at to get the oldest membership first
    )
    INSERT INTO folder_files (folder_id, file_id, agency_id, client_organization_id)
    SELECT DISTINCT
        root_folders.id AS folder_id,
        files.id AS file_id,
        root_folders.agency_id,
        root_folders.client_organization_id
    FROM unassigned_files files
    JOIN user_primary_organization upo
        ON files.user_id = upo.user_id
    JOIN organization_root_folders root_folders 
        ON upo.organization_id = COALESCE(root_folders.client_organization_id, root_folders.agency_id);

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Moved % files to their respective root folders', v_count;

END $$;