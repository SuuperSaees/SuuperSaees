import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { ChatMessages } from '~/lib/chat-messages.types';

export class ChatMessagesRepository {
  private client: SupabaseClient;
  private adminClient?: SupabaseClient;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(
    payload: ChatMessages.Insert,
  ): Promise<ChatMessages.TypeWithRelations> {
    const client = this.adminClient ?? this.client;

    const { data, error } = await client
      .from('chat_messages')
      .insert(payload)
      .select(`
        *,
        message:messages(*)
      `)
      .single();



    if (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }

    return data as ChatMessages.TypeWithRelations;
  }


  // * GET REPOSITORIES
  async list(chatId: string): Promise<GetMessagesResponse[]> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('chat_messages')
      .select('id, chat_id, user_id, content, role, created_at')
      .eq('chat_id', chatId);

    if (error) {
      throw new Error(
        `Error fetching messages for chat ${chatId}: ${error.message}`,
      );
    }

    return data as GetMessagesResponse[];
  }

  // * DELETE REPOSITORIES
  async delete(
    {
      chat_id,
      message_id,
    }: {
      chat_id?: string;
      message_id?: string;
    }
  ): Promise<void> {

    const client = this.adminClient ?? this.client;


    const { error } = await client
      .from('messages')
      .delete()
      .eq('id', message_id)
      .eq('chat_id', chat_id);



    if (error) {
      throw new Error(
        `Error deleting message ${messageId}: ${error.message}`,
      );
    }


    return {
      success: true,
      message: `Message ${messageId} successfully deleted.`,
    };

  }

  // * UPDATE REPOSITORIES
  async update(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    const client = this.adminClient ?? this.client;
    const { chat_id, message_id, new_content } = payload;

    const { error } = await client
      .from('chat_messages')
      .update({ content: new_content })
      .eq('chat_id', chat_id)
      .eq('id', message_id);

    if (error) {
      throw new Error(
        `Error updating content of message ${message_id} in chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Content of message ${message_id} successfully updated in chat ${chat_id}.`,
    };
  }
}
