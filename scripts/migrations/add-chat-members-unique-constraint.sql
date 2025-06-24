-- Migration: Add unique constraint to chat_members table
-- Description: Adds unique constraint on (chat_id, user_id) to prevent duplicates and enable upsert operations
-- Date: 2024-01-XX

BEGIN;

-- First, remove any existing duplicates before adding the constraint
-- Keep the most recent entry for each (chat_id, user_id) combination
DELETE FROM chat_members
WHERE id NOT IN (
    SELECT DISTINCT ON (chat_id, user_id) id
    FROM chat_members
    ORDER BY chat_id, user_id, updated_at DESC, created_at DESC
);

-- Add the unique constraint
ALTER TABLE chat_members 
ADD CONSTRAINT chat_members_chat_id_user_id_unique 
UNIQUE (chat_id, user_id);

COMMIT; 