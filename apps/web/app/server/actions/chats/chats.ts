import { Chats } from '~/lib/chats.types';
import { BaseAction } from '../base-action';
import { ChatController } from './controllers/chats.controller';
import { IChatAction } from './chats.interface';

export class ChatAction extends BaseAction implements IChatAction {
  private controller: ChatController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new ChatController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async create(payload: Chats.InsertWithRelations): Promise<Chats.Type> {
    return await this.controller.create(payload);
  }

  async list(userId: string): Promise<Chats.TypeWithRelations[]> {
    return await this.controller.list(userId);
  }

  async get(chatId: string, fetchLatest?: Chats.FetchLatest): Promise<Chats.TypeWithRelations> {
    return await this.controller.get(chatId, fetchLatest);
  }

  async delete(chatId: string): Promise<void> {
    return await this.controller.delete(chatId);
  }

  async update(payload: Chats.Update): Promise<Chats.Type> {
    return await this.controller.update(payload);
  }
}

export function createChatAction(baseUrl: string) {
  return new ChatAction(baseUrl);
}

