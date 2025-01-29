import { SupabaseClient } from '@supabase/supabase-js';

import {
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
} from '../../interfaces/chat.interfaces';
import { ChatRepository } from '../../repositories/chats/chat.repositories';

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
    return await this.chatRepository.updateChatSettings(payload);
  }
}
