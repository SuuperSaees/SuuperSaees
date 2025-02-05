import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { ChatMessages } from '~/lib/chat-messages.types';
import {
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteMessageResponse,
  GetMessagesResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from '../chat-messages.interface';
import { ChatMessagesRepository } from '../repositories/chat-messages.respository';
import { MessagesRepository } from '../../messages/repositories/messages.repository';
import { ChatMessagesService } from '../services/chat-messages.service';

export class MessagesController {
  private baseUrl: string
  private client: SupabaseClient<Database>
  private adminClient?: SupabaseClient<Database>

  constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
      this.baseUrl = baseUrl;
      this.client = client;
      this.adminClient = adminClient;
  }



  // * CREATE CONTROLLERS
  async createMessage(
    payload: ChatMessages.InsertWithRelations,
  ): Promise<ChatMessages.TypeWithRelations> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const messagesRepository = new MessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository, messagesRepository);
      return await chatMessageService.createMessage(payload);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.getMessages(chatId);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async deleteMessage(
    messageId: string,
  ): Promise<DeleteMessageResponse> {
    try {

      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.deleteMessage(messageId);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.clearChatMessages(payload);
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
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.updateMessageContent(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
