import { SupabaseClient } from '@supabase/supabase-js';

import {
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  UpdateChatSettingsPayload,
} from '../../interfaces/chat.interfaces';

export class ChatRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // * CREATE REPOSITORIES
  /**
   * @name createChat
   * @description Creates a new chat in the database.
   * @param {ChatPayload} payload - Data required to create the chat.
   * @returns {Promise<ChatResponse>} Response with the created chat.
   * @throws {Error} If an error occurs while inserting the chat.
   */
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    const { data, error } = await this.client
      .from('chats')
      .insert({
        name: payload.name,
        user_id: payload.user_id,
        settings: payload.settings ?? {},
        visibility: payload.visibility,
        image: payload.image ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }

    return data as ChatResponse;
  }

  // * GET REPOSITORIES
  /**
   * @name getChats
   * @description Retrieves all chats a specific member participates in.
   * @returns {Promise<GetChatsResponse[]>} List of chats the member is involved in.
   * @throws {Error} If an error occurs during the query.
   */
  async getChats(): Promise<GetChatsResponse[]> {
    const { data, error } = await this.client.from('chats').select(`
        id,
        name,
        user_id,
        settings,
        visibility,
        image,
        created_at,
        chat_members (user_id)
      `);

    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    return (data || []).map((chat) => ({
      id: chat.id,
      name: chat.name,
      user_id: chat.user_id,
      settings: chat.settings,
      visibility: chat.visibility,
      image: chat.image,
      created_at: chat.created_at,
      members_count: chat.chat_members?.length || 0,
    })) as GetChatsResponse[];
  }

  /**
   * @name getChatById
   * @description Queries the database to retrieve the details of a specific chat.
   * @param {string} chatId - ID of the chat to retrieve.
   * @returns {Promise<GetChatByIdResponse>} Chat details, including members and messages.
   * @throws {Error} If an error occurs during the query.
   */
  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    const { data: chat, error } = await this.client
      .from('chats')
      .select(
        `
        id,
        name,
        user_id,
        settings,
        visibility,
        image,
        created_at,
        updated_at,
        deleted_on,
        chat_members (
          user_id,
          role
        ),
        chat_messages (
          id,
          user_id,
          content,
          role,
          created_at
        )
      `,
      )
      .eq('id', chatId)
      .single();

    if (error) {
      throw new Error(
        `Error fetching chat with ID ${chatId}: ${error.message}`,
      );
    }

    return {
      id: chat.id,
      name: chat.name,
      user_id: chat.user_id,
      settings: chat.settings,
      visibility: chat.visibility,
      image: chat.image,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      deleted_on: chat.deleted_on,
      members: chat.chat_members || [],
      messages: chat.chat_messages || [],
    } as GetChatByIdResponse;
  }

  // * DELETE REPOSITORIES
  /**
   * @name deleteChat
   * @description Deletes a chat by its ID. Also deletes related messages and member relationships.
   * @param {string} chatId - ID of the chat to delete.
   * @returns {Promise<DeleteChatResponse>} Response indicating the result of the deletion.
   * @throws {Error} If there is an issue during the deletion process.
   */
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    const { error } = await this.client.from('chats').delete().eq('id', chatId);

    if (error) {
      throw new Error(`Error deleting chat: ${error.message}`);
    }

    return { success: true, message: `Chat ${chatId} successfully deleted.` };
  }

  // * UPDATE REPOSITORIES
  /**
   * @name updateChatSettings
   * @description Updates the settings of a chat in the database.
   * @param {UpdateChatSettingsPayload} payload - Data required to update the settings.
   * @returns {Promise<void>} Empty response if executed successfully, or throws an error.
   * @throws {Error} If any issue occurs during the operation.
   */
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await this.client
      .from('chats')
      .update({ settings: payload.settings })
      .eq('id', payload.chat_id);

    if (error) {
      throw new Error(`Error updating chat settings: ${error.message}`);
    }

    return {
      success: true,
      message: `Chat settings for chat ${payload.chat_id} updated successfully.`,
    };
  }
}
