import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import { MembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { ChatMessagesRepository } from '../../chat-messages/repositories/chat-messages.respository';
import {
  ChatPayload,
  DeleteChatResponse,
  GetChatByIdResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
} from '../chats.interface';
import { ChatRepository } from '../repositories/chats.repository';
import { ChatService } from '../services/chats.service';
import { Chats } from '~/lib/chats.types';

export class ChatController {
  private chatService: ChatService;


  constructor(
    baseUrl: string,
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    const chatRepository = new ChatRepository(client, adminClient);
    const membersRepository = new MembersRepository(client, adminClient);
    const messagesRepository = new ChatMessagesRepository(client, adminClient);

    this.chatService = new ChatService(
      chatRepository,
      membersRepository,
      messagesRepository,
    );
  }

  // * CREATE CONTROLLERS
  async createChat(payload: ChatPayload): Promise<Chats.Type> {
    try {
      return await this.chatService.createChat(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async getChats(): Promise<Chats.Type[]> {
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

  async updateChat(payload: Chats.Update): Promise<Chats.Type> {
    try {
      return await this.chatService.updateChat(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
