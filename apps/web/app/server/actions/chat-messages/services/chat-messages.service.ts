import { ChatMessages } from '~/lib/chat-messages.types';
import { Message } from '~/lib/message.types';
import {
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteMessageResponse,
  GetMessagesResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from '../chat-messages.interface';
import { ChatMessagesRepository } from '../repositories/chat-messages.respository';
import { MessagesRepository } from '../../messages/repositories/messages.repository';

export class ChatMessagesService {
  constructor(private readonly chatMessagesRepository: ChatMessagesRepository, private readonly messagesRepository?: MessagesRepository) {}


  // * CREATE SERVICES
  async createMessage(
    payload: ChatMessages.InsertWithRelations,
  ): Promise<ChatMessages.TypeWithRelations> {
    let chatMessage: ChatMessages.TypeWithRelations;

    if (!payload.message_id && payload.messages && payload.messages.length > 0 && this.messagesRepository) {
      const createdMessages = await Promise.all(
        payload.messages.map(message => this.messagesRepository?.createMessage(message))
      );
  
      const chatMessagePayload = {
        chat_id: payload.chat_id,
        message_id: createdMessages[createdMessages.length - 1]?.id ?? '',
      };
      
      chatMessage = await this.chatMessagesRepository.createMessage(chatMessagePayload);
      chatMessage.messages = createdMessages.map(message => message as Message.TypeOnly);
    } else {
      chatMessage = await this.chatMessagesRepository.createMessage(payload);
    }
  
    return chatMessage;
  }


  // * GET SERVICES
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.chatMessagesRepository.getMessages(chatId);
  }

  // * DELETE SERVICES
  async deleteMessage(
    messageId: string,
  ): Promise<DeleteMessageResponse> {
    return await this.chatMessagesRepository.deleteMessage(messageId);
  }                                                                                                                                                                

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    return await this.chatMessagesRepository.clearChatMessages(payload);
  }

  // * UPDATE SERVICES
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.chatMessagesRepository.updateMessageContent(payload);
  }
}
