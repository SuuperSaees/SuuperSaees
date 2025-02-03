import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import { MembersRepository } from '../../chat-members/repositories/members.repositories';
import { MessagesRepository } from '../../chat-messages/repositories/messages.respositories';
import {
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
} from '../chat.interface';
import { ChatRepository } from '../repositories/chat.repositories';
import { ChatService } from '../services/chat.services';

export class ChatController {
  private chatService: ChatService;

  constructor(
    baseUrl: string,
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    const chatRepository = new ChatRepository(client, adminClient);
    const membersRepository = new MembersRepository(client, adminClient);
    const messagesRepository = new MessagesRepository(client, adminClient);

    this.chatService = new ChatService(
      chatRepository,
      membersRepository,
      messagesRepository,
    );
  }

  // * CREATE CONTROLLERS
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    try {
      return await this.chatService.createChat(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async getChats(): Promise<GetChatsResponse[]> {
    try {
      return await this.chatService.getChats();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    try {
      return await this.chatService.getChatById(chatId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    try {
      return await this.chatService.deleteChat(chatId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    try {
      return await this.chatService.updateChatSettings(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
