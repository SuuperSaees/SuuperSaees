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
import { MessagesRepository } from '../../repositories/messages/messages.respositories';

export class MessagesService {
  private messagesRepository: MessagesRepository;

  constructor(
    _baseUrl: string,
    client: SupabaseClient,
    _adminClient: SupabaseClient,
  ) {
    this.messagesRepository = new MessagesRepository(client);
  }

  // * CREATE SERVICES
  /**
   * @name createMessage
   * @description Creates a new message in a chat.
   * @param {ChatMessagePayload} payload - Data of the message to create.
   * @returns {Promise<ChatMessageResponse>} Response with the created message.
   */
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    return await this.messagesRepository.createMessage(payload);
  }

  // * GET SERVICES
  /**
   * @name getMessages
   * @description Fetches all messages from a specific chat via the repository.
   * @param {string} chatId - The ID of the chat to fetch messages from.
   * @returns {Promise<GetMessagesResponse[]>} List of messages in the chat.
   */
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.messagesRepository.getMessages(chatId);
  }

  // * DELETE SERVICES
  /**
   * @name deleteMessage
   * @description Deletes a specific message from a chat by calling the repository.
   * @param {DeleteMessagePayload} payload - Data containing the chat ID and message ID to delete.
   * @returns {Promise<DeleteMessageResponse>} Response indicating the result of the deletion.
   */
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    return await this.messagesRepository.deleteMessage(payload);
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
    return await this.messagesRepository.clearChatMessages(payload);
  }

  // * UPDATE SERVICES
  /**
   * @name updateMessageContent
   * @description Updates the content of a specific message in a chat.
   * @param {UpdateMessageContentPayload} payload - Data required to perform the update.
   * @returns {Promise<UpdateMessageContentResponse>} Response indicating the success or failure of the operation.
   */
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.messagesRepository.updateMessageContent(payload);
  }
}
