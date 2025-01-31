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
} from '../interfaces/chat-interfaces';
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
    return await this.chatService.createChat(payload);
  }

  // * GET CONTROLLERS
  async getChats(): Promise<GetChatsResponse[]> {
    return await this.chatService.getChats();
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    return await this.chatService.getChatById(chatId);
  }

  // * DELETE CONTROLLERS
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    return await this.chatService.deleteChat(chatId);
  }

  // * UPDATE CONTROLLERS
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    return await this.chatService.updateChatSettings(payload);
  }
}
