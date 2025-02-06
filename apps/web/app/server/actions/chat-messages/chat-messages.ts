import { BaseAction } from '../base-action';
import { MessagesController } from './controllers/chat-messages.controller';
import { ChatMessages } from '~/lib/chat-messages.types';
import {
  DeleteMessagePayload,
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

  async create(
    payload: ChatMessages.InsertWithRelations,
  ): Promise<ChatMessages.TypeWithRelations> {
    return await this.controller.createMessage(payload);
  }


  async list(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.controller.getMessages(chatId);
  }

  async delete(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    return await this.controller.deleteMessage(payload);
  }

  async update(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.controller.updateMessageContent(payload);
  }
}

export function createMessagesAction(baseUrl: string) {
  return new MessagesAction(baseUrl);
}
