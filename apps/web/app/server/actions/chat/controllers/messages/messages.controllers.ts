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
import { MessagesService } from '../../services/messages/messages.servies';

export class MessagesController {
  private messagesService: MessagesService;

  constructor(
    baseUrl: string,
    client: SupabaseClient,
    adminClient: SupabaseClient,
  ) {
    this.messagesService = new MessagesService(baseUrl, client, adminClient);
  }

  // * CREATE CONTROLLERS
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    return await this.messagesService.createMessage(payload);
  }

  // * GET CONTROLLERS
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.messagesService.getMessages(chatId);
  }

  // * DELETE CONTROLLERS
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    return await this.messagesService.deleteMessage(payload);
  }

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    return await this.messagesService.clearChatMessages(payload);
  }

  // * UPDATE CONTROLLERS
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.messagesService.updateMessageContent(payload);
  }
}
