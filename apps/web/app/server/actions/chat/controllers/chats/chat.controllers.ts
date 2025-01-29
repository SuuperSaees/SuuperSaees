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
import { ChatService } from '../../services/chats/chat.services';

export class ChatController {
  private baseUrl: string;
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(
    baseUrl: string,
    client: SupabaseClient,
    adminClient: SupabaseClient,
  ) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.createChat(payload);
  }

  // * GET CONTROLLERS
  async getChats(): Promise<GetChatsResponse[]> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.getChats();
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.getChatById(chatId);
  }

  // * DELETE CONTROLLERS
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.deleteChat(chatId);
  }

  // * UPDATE CONTROLLERS
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.updateChatSettings(payload);
  }
}
