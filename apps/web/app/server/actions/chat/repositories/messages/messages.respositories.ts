import { SupabaseClient } from '@supabase/supabase-js';

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
} from '../../interfaces/chat.interfaces';

export class MessagesRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // * CREATE REPOSITORIES
  /**
   * @name createMessage
   * @description Creates a new message within a chat.
   * @param {ChatMessagePayload} payload - Data required to create the message.
   * @returns {Promise<{ success: boolean; message: string; data: ChatMessageResponse }>} Response with the created message.
   * @throws {Error} If an error occurs while inserting the message.
   */
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    const { data, error } = await this.client
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
  /**
   * @name getMessages
   * @description Fetches all messages from a specific chat.
   * @param {string} chatId - The ID of the chat to fetch messages from.
   * @returns {Promise<{ success: boolean; message: string; data: GetMessagesResponse[] }>} List of messages in the chat.
   * @throws {Error} If an error occurs while fetching messages.
   */
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    const { data, error } = await this.client
      .from('chat_messages')
      .select(
        `
        id,
        chat_id,
        user_id,
        content,
        role,
        created_at
      `,
      )
      .eq('chat_id', chatId);

    if (error) {
      throw new Error(
        `Error fetching messages for chat ${chatId}: ${error.message}`,
      );
    }

    return data as GetMessagesResponse[];
  }

  // * DELETE REPOSITORIES
  /**
   * @name deleteMessage
   * @description Deletes a specific message from a chat.
   * @param {DeleteMessagePayload} payload - Data containing the chat ID and message ID to delete.
   * @returns {Promise<{ success: boolean; message: string }>} Response indicating the result of the deletion.
   * @throws {Error} If an error occurs while deleting the message.
   */
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    const { chat_id, message_id } = payload;
    const { error } = await this.client
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

  /**
   * @name clearChatMessages
   * @description Clears all messages in a specific chat.
   * @param {ClearChatMessagesPayload} payload - Data containing the chat ID.
   * @returns {Promise<{ success: boolean; message: string }>} Response indicating the result of the clearing operation.
   * @throws {Error} If an error occurs while clearing messages.
   */
  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    const { chat_id } = payload;
    const { error } = await this.client
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
  /**
   * @name updateMessageContent
   * @description Updates the content of a specific message in a chat.
   * @param {UpdateMessageContentPayload} payload - Data required to update the message content.
   * @returns {Promise<{ success: boolean; message: string }>} Response indicating the success or failure of the operation.
   * @throws {Error} If an error occurs while updating the message.
   */
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    const { chat_id, message_id, new_content } = payload;

    const { error } = await this.client
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
