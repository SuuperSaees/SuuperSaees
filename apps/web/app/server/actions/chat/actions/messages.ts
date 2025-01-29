import { BaseAction } from '../../base-action';
import { MessagesController } from '../controllers/messages/messages.controllers';
import {
  ChatMessagePayload,
  ChatMessageResponse,
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteMessagePayload,
  DeleteMessageResponse,
  GetMessagesResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from '../interfaces/chat.interfaces';

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
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    return await this.controller.createMessage(payload);
  }

  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.controller.getMessages(chatId);
  }

  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    return await this.controller.deleteMessage(payload);
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
