-- Migration: Create credits records for existing clients before credits system
-- Date: 2025-07-17
-- Purpose: Migrate existing clients to the new credits system by creating their credits records

-- Function to migrate existing clients to credits system
CREATE OR REPLACE FUNCTION migrate_existing_clients_to_credits()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    client_record RECORD;
    owner_role text;
    membership_type text;
    org_owner_id uuid;
    credits_exists boolean;
    migrated_count integer := 0;
    skipped_count integer := 0;
    error_count integer := 0;
BEGIN
    RAISE NOTICE 'Starting migration of existing clients to credits system...';
    
    -- Loop through all existing clients
    FOR client_record IN 
        SELECT 
            c.id,
            c.agency_id,
            c.organization_client_id,
            c.user_client_id,
            c.created_at,
            o.name as organization_name,
            o.owner_id as org_owner_id
        FROM public.clients c
        LEFT JOIN public.organizations o ON o.id = c.organization_client_id
        WHERE c.deleted_on IS NULL
        ORDER BY c.created_at ASC
    LOOP
        BEGIN
            RAISE NOTICE 'Processing client ID: %, Organization: %, Agency: %', 
                client_record.id, 
                client_record.organization_name, 
                client_record.agency_id;
            
            -- Get the role of the owner of the client organization
            SELECT am.account_role INTO owner_role
            FROM public.accounts_memberships am
            WHERE am.user_id = client_record.org_owner_id 
            AND am.organization_id = client_record.organization_client_id
            LIMIT 1;

            -- If we didn't find a role in accounts_memberships, assume it's client
            IF owner_role IS NULL THEN
                membership_type := 'client';
                RAISE NOTICE 'No role found for owner, assuming client type';
            ELSE
                -- Determine if it's client or agency based on the role
                IF owner_role IN ('client_owner', 'client_member') THEN
                    membership_type := 'client';
                ELSIF owner_role IN ('agency_owner', 'agency_member', 'agency_project_manager') THEN
                    membership_type := 'agency';
                ELSE
                    membership_type := 'unknown';
                END IF;
                
                RAISE NOTICE 'Owner role: %, Membership type: %', owner_role, membership_type;
            END IF;

            -- Only create credits for client organizations
            IF membership_type = 'client' THEN
                -- Check if credits record already exists for this agency_id and client_organization_id
                SELECT EXISTS(
                    SELECT 1 FROM public.credits 
                    WHERE agency_id = client_record.agency_id 
                    AND client_organization_id = client_record.organization_client_id
                    AND deleted_on IS NULL
                ) INTO credits_exists;

                IF NOT credits_exists THEN
                    -- Create the credits record
                    INSERT INTO public.credits (
                        agency_id,
                        client_organization_id,
                        balance,
                        expired,
                        purchased,
                        refunded,
                        consumed,
                        locked,
                        user_id,
                        created_at,
                        updated_at
                    ) VALUES (
                        client_record.agency_id,
                        client_record.organization_client_id,
                        0, -- Starting balance
                        0, -- No expired credits initially
                        0, -- No purchased credits initially
                        0, -- No refunded credits initially
                        0, -- No consumed credits initially
                        0, -- No locked credits initially
                        NULL, -- No specific user initially
                        client_record.created_at, -- Use client creation date
                        NOW() -- Current timestamp for updated_at
                    );
                    
                    migrated_count := migrated_count + 1;
                    RAISE NOTICE 'Created credits record for client %. Total migrated: %', 
                        client_record.organization_name, migrated_count;
                ELSE
                    skipped_count := skipped_count + 1;
                    RAISE NOTICE 'Credits record already exists for client %. Skipped. Total skipped: %', 
                        client_record.organization_name, skipped_count;
                END IF;
            ELSE
                skipped_count := skipped_count + 1;
                RAISE NOTICE 'Client % is not a client organization (type: %). Skipped. Total skipped: %', 
                    client_record.organization_name, membership_type, skipped_count;
            END IF;

        EXCEPTION
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE WARNING 'Error processing client ID %, Organization %. Error: %. Total errors: %', 
                    client_record.id, 
                    client_record.organization_name, 
                    SQLERRM, 
                    error_count;
                -- Continue with next client
        END;
    END LOOP;

    -- Final summary
    RAISE NOTICE '=== MIGRATION COMPLETED ===';
    RAISE NOTICE 'Total clients migrated: %', migrated_count;
    RAISE NOTICE 'Total clients skipped: %', skipped_count;
    RAISE NOTICE 'Total errors encountered: %', error_count;
    RAISE NOTICE 'Migration finished successfully!';
    
END;
$$;

-- Execute the migration
DO $$
BEGIN
    RAISE NOTICE 'Starting credits system migration for existing clients...';
    PERFORM migrate_existing_clients_to_credits();
    RAISE NOTICE 'Credits system migration completed!';
END;
$$;

-- Drop the temporary function after migration
DROP FUNCTION IF EXISTS migrate_existing_clients_to_credits();

-- Verify migration results
DO $$
DECLARE
    total_clients integer;
    total_credits integer;
    clients_without_credits integer;
BEGIN
    -- Count total clients
    SELECT COUNT(*) INTO total_clients
    FROM public.clients 
    WHERE deleted_on IS NULL;
    
    -- Count total credits records
    SELECT COUNT(*) INTO total_credits
    FROM public.credits 
    WHERE deleted_on IS NULL;
    
    -- Count clients without credits (should ideally be 0 after migration)
    SELECT COUNT(*) INTO clients_without_credits
    FROM public.clients c
    LEFT JOIN public.credits cr ON (
        cr.agency_id = c.agency_id 
        AND cr.client_organization_id = c.organization_client_id
        AND cr.deleted_on IS NULL
    )
    WHERE c.deleted_on IS NULL 
    AND cr.id IS NULL;
    
    RAISE NOTICE '=== MIGRATION VERIFICATION ===';
    RAISE NOTICE 'Total active clients: %', total_clients;
    RAISE NOTICE 'Total credits records: %', total_credits;
    RAISE NOTICE 'Clients without credits: %', clients_without_credits;
    
    IF clients_without_credits > 0 THEN
        RAISE WARNING 'Some clients still do not have credits records. Manual review may be needed.';
    ELSE
        RAISE NOTICE 'All clients now have credits records. Migration successful!';
    END IF;
END;
$$;
