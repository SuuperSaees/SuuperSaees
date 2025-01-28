import { SupabaseClient } from '@supabase/supabase-js';

import {
  AddMembersPayload,
  AddMembersResponse,
  ChatMessagePayload,
  ChatMessageResponse,
  ChatPayload,
  ChatResponse,
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteChatResponse,
  DeleteMessagePayload,
  DeleteMessageResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  GetMembersResponse,
  GetMessagesResponse,
  MemberSettingsResponse,
  RemoveMemberPayload,
  RemoveMemberResponse,
  ResetMemberSettingsPayload,
  ResetMemberSettingsResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
  UpdateMemberSettingsPayload,
  UpdateMemberSettingsResponse,
  UpdateMemberVisibilityPayload,
  UpdateMemberVisibilityResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from '../chat.interfaces';
import { ChatRepository } from '../repositories/chat.repositories';

export class ChatService {
  private chatRepository: ChatRepository;

  constructor(
    _baseUrl: string,
    client: SupabaseClient,
    _adminClient: SupabaseClient,
  ) {
    this.chatRepository = new ChatRepository(client);
  }

  // * CREATE SERVICES
  /**
   * @name createChat
   * @description Creates a chat in the database.
   * @param {ChatPayload} payload - Data required to create the chat.
   * @returns {Promise<ChatResponse>} Response with the created chat.
   */
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    return await this.chatRepository.createChat(payload);
  }

  /**
   * @name addMembersToChat
   * @description Adds members to an existing chat.
   * @param {AddMembersPayload} payload - Data containing the chat ID and the members to add.
   * @returns {Promise<AddMembersResponse>} Response indicating whether the members were successfully added.
   */
  async addMembersToChat(
    payload: AddMembersPayload,
  ): Promise<AddMembersResponse> {
    const { chat_id, members } = payload;
    await this.chatRepository.addMembers(chat_id, members);

    return {
      success: true,
      message: `Miembros agregados con éxito al chat ${chat_id}.`,
    };
  }

  /**
   * @name createMessage
   * @description Creates a new message in a chat.
   * @param {ChatMessagePayload} payload - Data of the message to create.
   * @returns {Promise<ChatMessageResponse>} Response with the created message.
   */
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    return await this.chatRepository.createMessage(payload);
  }

  //* GET SERVICES
  /**
   * @name getChats
   * @description Retrieves all chats accessible by the user from the repository.
   * @returns {Promise<GetChatsResponse[]>} List of chats accessible by the user.
   */
  async getChats(): Promise<GetChatsResponse[]> {
    return await this.chatRepository.getChats();
  }

  /**
   * @name getChatById
   * @description Calls the repository to get the details of a specific chat.
   * @param {string} chatId - ID of the chat to retrieve.
   * @returns {Promise<GetChatByIdResponse>} Chat details.
   */
  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    return await this.chatRepository.getChatById(chatId);
  }

  /**
   * @name getMembers
   * @description Fetches all members of a specific chat from the repository.
   * @param {string} chatId - The ID of the chat to fetch members for.
   * @returns {Promise<GetMembersResponse[]>} List of members with their roles and settings.
   */
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    return await this.chatRepository.getMembers(chatId);
  }

  /**
   * @name getMessages
   * @description Fetches all messages from a specific chat via the repository.
   * @param {string} chatId - The ID of the chat to fetch messages from.
   * @returns {Promise<GetMessagesResponse[]>} List of messages in the chat.
   */
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.chatRepository.getMessages(chatId);
  }

  /**
   * @name getMemberSettings
   * @description Fetches the settings of a specific member in a chat via the repository.
   * @param {string} chatId - The ID of the chat
   * @param {string} userId - The ID of the user
   * @returns {Promise<MemberSettingsResponse>} The member's settings in the chat.
   */
  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.chatRepository.getMemberSettings(chatId, userId);
  }

  // * DELETE SERVICES
  /**
   * @name deleteChat
   * @description Deletes a chat from the database. Ensures related messages and member relationships are also deleted.
   * @param {string} chatId - ID of the chat to delete.
   * @returns {Promise<DeleteChatResponse>} Response indicating the result of the deletion.
   */
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    return await this.chatRepository.deleteChat(chatId);
  }

  /**
   * @name removeMember
   * @description Removes a member from a chat by calling the repository.
   * @param {RemoveMemberPayload} payload - Data containing the chat ID and user ID to remove.
   * @returns {Promise<RemoveMemberResponse>} Response indicating the result of the removal.
   */
  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    const { chat_id, user_id } = payload;
    await this.chatRepository.removeMember(chat_id, user_id);

    return {
      success: true,
      message: `Miembro ${user_id} eliminado del chat ${chat_id} con éxito.`,
    };
  }

  /**
   * @name deleteMessage
   * @description Deletes a specific message from a chat by calling the repository.
   * @param {DeleteMessagePayload} payload - Data containing the chat ID and message ID to delete.
   * @returns {Promise<DeleteMessageResponse>} Response indicating the result of the deletion.
   */
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    const { chat_id, message_id } = payload;
    await this.chatRepository.deleteMessage(chat_id, message_id);

    return {
      success: true,
      message: `Mensaje ${message_id} eliminado del chat ${chat_id} con éxito.`,
    };
  }

  /**
   * @name clearChatMessages
   * @description Clears all messages in a specific chat by calling the repository.
   * @param {ClearChatMessagesPayload} payload - Data containing the chat ID.
   * @returns {Promise<ClearChatMessagesResponse>} Response indicating the result of the clearing operation.
   */
  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    const { chat_id } = payload;
    await this.chatRepository.clearChatMessages(chat_id);

    return {
      success: true,
      message: `Todos los mensajes del chat ${chat_id} han sido eliminados.`,
    };
  }

  /**
   * @name resetMemberSettings
   * @description Resets the settings of a specific member in a chat by calling the repository.
   * @param {ResetMemberSettingsPayload} payload - Data containing the chat ID and user ID.
   * @returns {Promise<ResetMemberSettingsResponse>} Response indicating the result of the reset operation.
   */
  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    const { chat_id, user_id } = payload;
    await this.chatRepository.resetMemberSettings(chat_id, user_id);

    return {
      success: true,
      message: `Las configuraciones del miembro ${user_id} en el chat ${chat_id} han sido reseteadas.`,
    };
  }

  // * UPDATE SERVICES
  /**
   * @name updateChatSettings
   * @description Calls the repository to update the settings of a chat.
   * @param {UpdateChatSettingsPayload} payload - Data required for the operation.
   * @returns {Promise<UpdateChatSettingsResponse>} Response indicating whether the operation was successful.
   */
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    await this.chatRepository.updateChatSettings(payload);

    return {
      success: true,
      message: `Configuraciones actualizadas correctamente para el chat ${payload.chat_id}.`,
    };
  }

 /**
   * @name updateMemberVisibility
   * @description Calls the repository to update the visibility of a member in a chat.
   * @param {UpdateMemberVisibilityPayload} payload - Data required for the operation.
   * @returns {Promise<UpdateMemberVisibilityResponse>} Response indicating whether the operation was successful.
   */
  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    await this.chatRepository.updateMemberVisibility(payload);

    return {
      success: true,
      message: `Visibilidad del miembro ${payload.user_id} actualizada correctamente en el chat ${payload.chat_id}.`,
    };
  }

  /**
   * @name updateMemberSettings
   * @description Updates the settings of a specific member in a chat.
   * @param {UpdateMemberSettingsPayload} payload - Data required to perform the update.
   * @returns {Promise<UpdateMemberSettingsResponse>} Response indicating the success or failure of the operation.
   */
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    await this.chatRepository.updateMemberSettings(payload);

    return {
      success: true,
      message: `Configuraciones del miembro ${payload.user_id} actualizadas con éxito en el chat ${payload.chat_id}.`,
    };
  }

  /**
   * @name updateMessageContent
   * @description Updates the content of a specific message in a chat.
   * @param {UpdateMessageContentPayload} payload - Data required to perform the update.
   * @returns {Promise<UpdateMessageContentResponse>} Response indicating the success or failure of the operation.
   */
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    await this.chatRepository.updateMessageContent(payload);

    return {
      success: true,
      message: `Contenido del mensaje ${payload.message_id} actualizado con éxito en el chat ${payload.chat_id}.`,
    };
  }
}
