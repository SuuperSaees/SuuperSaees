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
} from '../interfaces/message-interfaces';
import { MessagesRepository } from '../repositories/messages.respositories';

export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  // * CREATE SERVICES
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    return await this.messagesRepository.createMessage(payload);
  }

  // * GET SERVICES
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.messagesRepository.getMessages(chatId);
  }

  // * DELETE SERVICES
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    return await this.messagesRepository.deleteMessage(payload);
  }

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    return await this.messagesRepository.clearChatMessages(payload);
  }

  // * UPDATE SERVICES
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.messagesRepository.updateMessageContent(payload);
  }
}
