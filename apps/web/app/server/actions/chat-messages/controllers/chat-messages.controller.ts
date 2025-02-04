import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { ChatMessages } from '~/lib/chat-messages.types';
import {
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteMessagePayload,
  DeleteMessageResponse,
  GetMessagesResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from '../chat-messages.interface';
import { MessagesRepository } from '../repositories/chat-messages.respository';
import { MessagesService } from '../services/chat-messages.service';

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
    payload: ChatMessages.Insert,
  ): Promise<ChatMessages.Type> {
    try {

      return await this.messagesService.createMessage(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    try {
      return await this.messagesService.getMessages(chatId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    try {
      return await this.messagesService.deleteMessage(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    try {
      return await this.messagesService.clearChatMessages(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    try {
      return await this.messagesService.updateMessageContent(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
