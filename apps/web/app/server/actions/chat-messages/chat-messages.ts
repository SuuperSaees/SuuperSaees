import { BaseAction } from '../base-action';
import { MessagesController } from './controllers/chat-messages.controller';
import { ChatMessages } from '~/lib/chat-messages.types';
import {
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteMessageResponse,
  GetMessagesResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from './chat-messages.interface';

export class MessagesAction extends BaseAction {
  private controller: MessagesController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new MessagesController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async createMessage(
    payload: ChatMessages.InsertWithRelations,
  ): Promise<ChatMessages.TypeWithRelations> {
    return await this.controller.createMessage(payload);
  }


  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.controller.getMessages(chatId);
  }

  async deleteMessage(
    messageId: string,
  ): Promise<DeleteMessageResponse> {
    return await this.controller.deleteMessage(messageId);
  }


  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    return await this.controller.clearChatMessages(payload);
  }

  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.controller.updateMessageContent(payload);
  }
}

export function createMessagesAction(baseUrl: string) {
  return new MessagesAction(baseUrl);
}
