ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_chat_id_fkey;

ALTER TABLE chat_messages 
ADD COLUMN chat_id_new uuid;

ALTER TABLE chats 
ALTER COLUMN id DROP IDENTITY IF EXISTS;

ALTER TABLE chats 
ADD COLUMN id_new uuid DEFAULT gen_random_uuid();

UPDATE chats 
SET id_new = id::text::uuid;

UPDATE chat_messages 
SET chat_id_new = chat_id::text::uuid;

ALTER TABLE chats 
DROP COLUMN id;

ALTER TABLE chats 
RENAME COLUMN id_new TO id;

ALTER TABLE chat_messages 
DROP COLUMN chat_id;

ALTER TABLE chat_messages 
RENAME COLUMN chat_id_new TO chat_id;

ALTER TABLE chats 
ADD PRIMARY KEY (id);

ALTER TABLE chat_messages 
ALTER COLUMN chat_id SET NOT NULL;

ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_chat_id_fkey 
FOREIGN KEY (chat_id) REFERENCES chats(id);