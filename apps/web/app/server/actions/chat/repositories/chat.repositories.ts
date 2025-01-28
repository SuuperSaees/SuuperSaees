import { SupabaseClient } from '@supabase/supabase-js';

import {
  ChatMessagePayload,
  ChatMessageResponse,
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  GetMembersResponse,
  GetMessagesResponse,
  MemberSettingsResponse,
  UpdateChatSettingsPayload,
  UpdateMemberSettingsPayload,
  UpdateMemberVisibilityPayload,
  UpdateMessageContentPayload,
} from '../chat.interfaces';

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
      throw new Error(`Error al crear el chat: ${error.message}`);
    }

    return data as ChatResponse;
  }

  /**
   * @name addMembers
   * @description Adds members to an existing chat. Updates them if they already exist.
   * @param {string} chat_id - Chat ID to add members to.
   * @param {Array<{ user_id: string, role: string }>} members - List of members with their roles to add to the chat.
   * @returns {Promise<void>} Empty response on success, throws an error if something fails.
   * @throws {Error} If an error occurs while adding members.
   */
  async addMembers(
    chat_id: string,
    members: { user_id: string; role: string }[],
  ): Promise<void> {
    const { error } = await this.client.from('chat_members').upsert(
      members.map((member) => ({
        chat_id,
        user_id: member.user_id,
        role: member.role,
      })),
    );

    if (error) {
      throw new Error(`Error al agregar miembros al chat: ${error.message}`);
    }
  }

  /**
   * @name createMessage
   * @description Creates a new message within a chat.
   * @param {ChatMessagePayload} payload - Data required to create the message (chat_id, user_id, content, role).
   * @returns {Promise<ChatMessageResponse>} Response with the created message.
   * @throws {Error} If an error occurs while inserting the message.
   */
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    const { data, error } = await this.client
      .from('chat_message')
      .insert({
        chat_id: payload.chat_id,
        user_id: payload.user_id,
        content: payload.content,
        role: payload.role,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear el mensaje: ${error.message}`);
    }

    return data as ChatMessageResponse;
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
      throw new Error(`Error al obtener los chats: ${error.message}`);
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
        `Error al obtener el chat con ID ${chatId}: ${error.message}`,
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

  /**
   * @name getMembers
   * @description Fetches all members of a specific chat from the database.
   * @param {string} chatId - The ID of the chat to fetch members for.
   * @returns {Promise<GetMembersResponse[]>} List of members with their roles and settings.
   * @throws {Error} If an error occurs while fetching the members.
   */
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    const { data, error } = await this.client
      .from('chat_members')
      .select(
        `
        user_id,
        role,
        settings,
        created_at
      `,
      )
      .eq('chat_id', chatId);

    if (error) {
      throw new Error(
        `Error al obtener miembros del chat con ID ${chatId}: ${error.message}`,
      );
    }

    return (data || []).map((member) => ({
      user_id: member.user_id,
      role: member.role,
      settings: member.settings,
      joined_at: member.created_at,
    })) as GetMembersResponse[];
  }

  /**
   * @name getMessages
   * @description Fetches all messages from a specific chat in the database.
   * @param {string} chatId - The ID of the chat to fetch messages from.
   * @returns {Promise<GetMessagesResponse[]>} List of messages in the chat.
   * @throws {Error} If an error occurs while fetching the messages.
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
        `Error al obtener mensajes del chat con ID ${chatId}: ${error.message}`,
      );
    }

    return data as GetMessagesResponse[];
  }

  /**
   * @name getMemberSettings
   * @description Fetches the settings of a specific member in a chat from the database.
   * @param {string} chatId - The ID of the chat
   * @param {string} userId - The ID of the user
   * @returns {Promise<MemberSettingsResponse>} The member's settings in the chat.
   * @throws {Error} If an error occurs while fetching the settings.
   */
  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    const { data, error } = await this.client
      .from('chat_members')
      .select('user_id, chat_id, settings')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(
        `Error al obtener la configuración del miembro: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error('Configuración del miembro no encontrada.');
    }

    return {
      user_id: data.user_id,
      chat_id: data.chat_id,
      settings: data.settings,
    } as MemberSettingsResponse;
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
      throw new Error(`Error al eliminar el chat: ${error.message}`);
    }

    return { success: true, message: `Chat ${chatId} eliminado con éxito.` };
  }

  /**
   * @name removeMember
   * @description Removes a member from a chat in the database.
   * @param {string} chat_id - ID of the chat.
   * @param {string} user_id - ID of the user to remove.
   * @returns {Promise<void>} Response indicating success or throws an error if something goes wrong.
   * @throws {Error} If there is an issue during the removal process.
   */
  async removeMember(chat_id: string, user_id: string): Promise<void> {
    const { error } = await this.client
      .from('chat_members')
      .delete()
      .eq('chat_id', chat_id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(
        `Error al eliminar al miembro del chat: ${error.message}`,
      );
    }
  }

  /**
   * @name deleteMessage
   * @description Deletes a specific message from a chat in the database.
   * @param {string} chat_id - ID of the chat.
   * @param {string} message_id - ID of the message to delete.
   * @returns {Promise<void>} Response indicating success or throws an error if something goes wrong.
   * @throws {Error} If there is an issue during the deletion process.
   */
  async deleteMessage(chat_id: string, message_id: string): Promise<void> {
    const { error } = await this.client
      .from('chat_message')
      .delete()
      .eq('chat_id', chat_id)
      .eq('id', message_id);

    if (error) {
      throw new Error(
        `Error al eliminar el mensaje del chat: ${error.message}`,
      );
    }
  }

  /**
   * @name clearChatMessages
   * @description Clears all messages in a specific chat from the database.
   * @param {string} chat_id - ID of the chat whose messages should be cleared.
   * @returns {Promise<void>} Response indicating success or throws an error if something goes wrong.
   * @throws {Error} If there is an issue during the clearing process.
   */
  async clearChatMessages(chat_id: string): Promise<void> {
    const { error } = await this.client
      .from('chat_message')
      .delete()
      .eq('chat_id', chat_id);

    if (error) {
      throw new Error(
        `Error al borrar los mensajes del chat: ${error.message}`,
      );
    }
  }

  /**
   * @name resetMemberSettings
   * @description Resets the settings of a specific member in a chat in the database.
   * @param {string} chat_id - ID of the chat.
   * @param {string} user_id - ID of the member whose settings should be reset.
   * @returns {Promise<void>} Response indicating success or throws an error if something goes wrong.
   * @throws {Error} If there is an issue during the reset process.
   */
  async resetMemberSettings(chat_id: string, user_id: string): Promise<void> {
    const { error } = await this.client
      .from('chat_member_settings')
      .update({ settings: {} })
      .eq('chat_id', chat_id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(
        `Error al resetear las configuraciones del miembro: ${error.message}`,
      );
    }
  }

  // * UPDATE REPOSITORIES
  /**
   * @name updateChatSettings
   * @description Updates the settings of a chat in the database.
   * @param {UpdateChatSettingsPayload} payload - Data required to update the settings.
   * @returns {Promise<void>} Empty response if executed successfully, or throws an error.
   * @throws {Error} If any issue occurs during the operation.
   */
  async updateChatSettings(payload: UpdateChatSettingsPayload): Promise<void> {
    const { error } = await this.client
      .from('chats')
      .update({ settings: payload.settings })
      .eq('id', payload.chat_id);

    if (error) {
      throw new Error(
        `Error al actualizar configuraciones del chat: ${error.message}`,
      );
    }
  }

  /**
   * @name updateMemberVisibility
   * @description Updates the visibility of a member in a chat in the database.
   * @param {UpdateMemberVisibilityPayload} payload - Data required for the operation.
   * @returns {Promise<void>} Empty response if executed successfully, or throws an error.
   * @throws {Error} If any issue occurs during the operation.
   */
  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<void> {
    const { error } = await this.client
      .from('chat_members')
      .update({ visibility: payload.visibility })
      .eq('chat_id', payload.chat_id)
      .eq('user_id', payload.user_id);

    if (error) {
      throw new Error(
        `Error al actualizar la visibilidad del miembro: ${error.message}`,
      );
    }
  }

  /**
   * @name updateMemberSettings
   * @description Updates the settings of a specific member in a chat in the database.
   * @param {UpdateMemberSettingsPayload} payload - Data required to perform the update.
   * @returns {Promise<void>} No response, throws an error if something goes wrong.
   * @throws {Error} If an error occurs during the update.
   */
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<void> {
    const { chat_id, user_id, settings } = payload;

    const { error } = await this.client
      .from('chat_members')
      .update({ settings })
      .eq('chat_id', chat_id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(
        `Error al actualizar las configuraciones del miembro ${user_id} en el chat ${chat_id}: ${error.message}`,
      );
    }
  }

  /**
   * @name updateMessageContent
   * @description Updates the content of a specific message in the database.
   * @param {UpdateMessageContentPayload} payload - Data required to perform the update.
   * @returns {Promise<void>} No response, throws an error if something goes wrong.
   * @throws {Error} If an error occurs during the update.
   */
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<void> {
    const { chat_id, message_id, new_content } = payload;

    const { error } = await this.client
      .from('chat_message')
      .update({ content: new_content })
      .eq('chat_id', chat_id)
      .eq('id', message_id);

    if (error) {
      throw new Error(
        `Error al actualizar el contenido del mensaje ${message_id} en el chat ${chat_id}: ${error.message}`,
      );
    }
  }
}
