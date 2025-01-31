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
} from '../interfaces/message-interfaces';
import { MessagesRepository } from '../repositories/messages.respositories';
import { MessagesService } from '../services/messages.servies';

export class MessagesController {
  private messagesService: MessagesService;

  constructor(
    baseUrl: string,
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    const messagesRepository = new MessagesRepository(client, adminClient);
    this.messagesService = new MessagesService(messagesRepository);
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
