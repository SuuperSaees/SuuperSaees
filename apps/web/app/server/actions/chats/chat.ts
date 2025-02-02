import { Chats } from '~/lib/chats.types';
import { BaseAction } from '../base-action';
import { ChatController } from './controllers/chat.controllers';
import {
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
} from './chat.interface';

export class ChatAction extends BaseAction {
  private controller: ChatController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new ChatController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    return await this.controller.createChat(payload);
  }

  async getChats(): Promise<Chats.Type[]> {
    return await this.controller.getChats();
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    return await this.controller.getChatById(chatId);
  }

  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    return await this.controller.deleteChat(chatId);
  }

  async updateChat(payload: Chats.Update): Promise<Chats.Type> {
    return await this.controller.updateChat(payload);
  }

  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    return await this.controller.updateChatSettings(payload);
  }
}

export function createChatAction(baseUrl: string) {
  return new ChatAction(baseUrl);
}
