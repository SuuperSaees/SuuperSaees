-- Add the unique constraint
ALTER TABLE chat_members 
ADD CONSTRAINT chat_members_chat_id_user_id_unique 
UNIQUE (chat_id, user_id);

COMMIT; 