'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Message } from '../../../../../../../../apps/web/lib/message.types';


export const updateFile = async (
  fileId: string, // Add fileId as a parameter
  messageId: Message.Type['id'],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const fileToUpdate = {
      message_id: messageId ?? null,
    };
    const { data: fileData, error: fileError } = await client
      .from('files')
      .update(fileToUpdate)
      .eq('id', fileId) // Add the WHERE clause here to target the specific file
      .select()
      .single();

    if (fileError) throw fileError;
    return fileData;
  } catch (error) {
    console.error('Error updating the file:', error);
    throw error;
  }
};