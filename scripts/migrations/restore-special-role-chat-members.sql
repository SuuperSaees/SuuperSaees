-- Migration: Restore missing agency owners and project managers to chat_members
-- Description: Ensures all active chats have agency_owner and agency_project_manager members
-- Date: 2024-01-XX

BEGIN;

-- Insert missing agency owners and project managers for all active chats
INSERT INTO chat_members (
    chat_id,
    user_id,
    type,
    visibility,
    created_at,
    updated_at
)
SELECT DISTINCT
    c.id as chat_id,
    am.user_id,
    CASE 
        WHEN am.account_role = 'agency_owner' THEN 'owner'::chat_role_type
        WHEN am.account_role = 'agency_project_manager' THEN 'project_manager'::chat_role_type
    END as type,
    false as visibility, -- Set to false since they weren't explicitly selected
    NOW() as created_at,
    NOW() as updated_at
FROM chats c
JOIN accounts_memberships am ON am.organization_id = c.agency_id
WHERE 
    -- Only process active chats (not soft deleted)
    c.deleted_on IS NULL
    -- Only include agency owners and project managers
    AND am.account_role IN ('agency_owner', 'agency_project_manager')
    -- Only insert if the combination doesn't already exist
    AND NOT EXISTS (
        SELECT 1 
        FROM chat_members cm 
        WHERE cm.chat_id = c.id 
        AND cm.user_id = am.user_id
        AND cm.deleted_on IS NULL
    );

-- Update existing soft-deleted entries instead of creating duplicates
UPDATE chat_members 
SET 
    deleted_on = NULL,
    type = CASE 
        WHEN am.account_role = 'agency_owner' THEN 'owner'::chat_role_type
        WHEN am.account_role = 'agency_project_manager' THEN 'project_manager'::chat_role_type
    END,
    visibility = false,
    updated_at = NOW()
FROM chats c
JOIN accounts_memberships am ON am.organization_id = c.agency_id
WHERE 
    chat_members.chat_id = c.id
    AND chat_members.user_id = am.user_id
    AND c.deleted_on IS NULL
    AND am.account_role IN ('agency_owner', 'agency_project_manager')
    AND chat_members.deleted_on IS NOT NULL;

COMMIT;

-- Verification query (uncomment to run after migration):
/*
SELECT 
    c.id as chat_id,
    c.name as chat_name,
    c.agency_id,
    cm.user_id,
    cm.type,
    cm.visibility,
    am.account_role
FROM chats c
JOIN chat_members cm ON cm.chat_id = c.id
JOIN accounts_memberships am ON am.user_id = cm.user_id AND am.organization_id = c.agency_id
WHERE 
    c.deleted_on IS NULL
    AND cm.deleted_on IS NULL
    AND am.account_role IN ('agency_owner', 'agency_project_manager')
ORDER BY c.id, am.account_role;
*/ 