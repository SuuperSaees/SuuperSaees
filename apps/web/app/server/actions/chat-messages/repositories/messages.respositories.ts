import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import {
  ChatMessagePayload,
  ChatMessageResponse,
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteMessagePayload,
  DeleteMessageResponse,
  GetMessagesResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from '../message.interface';

export class MessagesRepository {
  private client: SupabaseClient;
  private adminClient?: SupabaseClient;

  constructor(
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('chat_messages')
      .insert({
        chat_id: payload.chat_id,
        user_id: payload.user_id,
        content: payload.content,
        role: payload.role,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }

    return data as ChatMessageResponse;
  }

  // * GET REPOSITORIES
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
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
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    const client = this.adminClient ?? this.client;
    const { chat_id, message_id } = payload;
    const { error } = await client
      .from('chat_messages')
      .delete()
      .eq('chat_id', chat_id)
      .eq('id', message_id);

    if (error) {
      throw new Error(
        `Error deleting message ${message_id} from chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Message ${message_id} successfully deleted from chat ${chat_id}.`,
    };
  }

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    const client = this.adminClient ?? this.client;
    const { chat_id } = payload;
    const { error } = await client
      .from('chat_messages')
      .delete()
      .eq('chat_id', chat_id);

    if (error) {
      throw new Error(
        `Error clearing messages for chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `All messages from chat ${chat_id} have been successfully cleared.`,
    };
  }

  // * UPDATE REPOSITORIES
  async updateMessageContent(
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
