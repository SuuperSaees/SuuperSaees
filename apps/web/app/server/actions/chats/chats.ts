import { Chats } from '~/lib/chats.types';
import { BaseAction } from '../base-action';
import { ChatController } from './controllers/chats.controller';
import {
  ChatPayload,
  DeleteChatResponse,
} from './chats.interface';

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

  async create(payload: ChatPayload): Promise<Chats.Type> {
    return await this.controller.create(payload);
  }

  async list(): Promise<Chats.Type[]> {
    return await this.controller.list();
  }

  async get(chatId: string): Promise<Chats.TypeWithRelations> {
    return await this.controller.get(chatId);
  }

  async delete(chatId: string): Promise<DeleteChatResponse> {
    return await this.controller.delete(chatId);
  }

  async update(payload: Chats.Update): Promise<Chats.Type> {
    return await this.controller.update(payload);
  }
}

export function createChatAction(baseUrl: string) {
  return new ChatAction(baseUrl);
}

