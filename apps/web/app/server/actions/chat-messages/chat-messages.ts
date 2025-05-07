import { BaseAction } from '../base-action';
import { ChatMessagesController } from './controllers/chat-messages.controller';
import { ChatMessages } from '~/lib/chat-messages.types';
import { IChatMessagesActions } from './chat-messages.interface';
import { Message } from '~/lib/message.types';

export class ChatMessagesAction extends BaseAction implements IChatMessagesActions {
  private controller: ChatMessagesController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new ChatMessagesController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async create(
    payload: ChatMessages.InsertWithRelations,
  ): Promise<ChatMessages.TypeWithRelations> {
    return await this.controller.create(payload);
  }

  async list(chatId: string | number, config?: ChatMessages.Configuration): Promise<Message.Response> {
    return await this.controller.list(chatId, config);
  }

  async delete(
    chatId?: string,
    messageId?: string,
  ): Promise<void> {
    return await this.controller.delete(chatId, messageId);
  }

  async update(
    payload: ChatMessages.Update,
  ): Promise<ChatMessages.Type> {
    return await this.controller.update(payload);
  }
}

export function createChatMessagesAction(baseUrl: string) {
  return new ChatMessagesAction(baseUrl);
}
