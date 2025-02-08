import { ChatMessages } from '~/lib/chat-messages.types';
import { Message } from '~/lib/message.types';
import { ChatMessagesRepository } from '../repositories/chat-messages.respository';
import { MessagesRepository } from '../../messages/repositories/messages.repository';

export class ChatMessagesService {
  constructor(private readonly chatMessagesRepository: ChatMessagesRepository, private readonly messagesRepository?: MessagesRepository) {}


  // * CREATE SERVICES
  async create(
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
      
      chatMessage = await this.chatMessagesRepository.create(chatMessagePayload);
      chatMessage.messages = createdMessages.map(message => message as Message.TypeOnly);
    } else {
      chatMessage = await this.chatMessagesRepository.create(payload);
    }
  
    return chatMessage;
  }


  // * GET SERVICES
  async list(chatId: string): Promise<ChatMessages.TypeWithRelations[]> {
    return await this.chatMessagesRepository.list(chatId);
  }


  // * DELETE SERVICES
  async delete(
    chatId?: string,
    messageId?: string,
  ): Promise<void> {
    return await this.chatMessagesRepository.delete({chat_id: chatId, message_id: messageId});
  }



  // * UPDATE SERVICES
  async update(
    payload: ChatMessages.Update,
  ): Promise<ChatMessages.Type> {
    return await this.chatMessagesRepository.update(payload);
  }
}
