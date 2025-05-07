import { ChatMessages } from '~/lib/chat-messages.types';
import { Message } from '~/lib/message.types';
import { ChatMessagesRepository } from '../repositories/chat-messages.respository';
import { MessagesRepository } from '../../messages/repositories/messages.repository';
import { ChatMembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { sendChatMessageEmail } from './send-email.service';
import { ChatRepository } from '../../chats/repositories/chats.repository';
export class ChatMessagesService {
  constructor(
    private readonly chatMessagesRepository: ChatMessagesRepository,
    private readonly messagesRepository?: MessagesRepository,
    private readonly chatMembersRepository?: ChatMembersRepository,
    private readonly chatRepository?: ChatRepository
  ) {}

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
  async list(chatId: string | number, config?: ChatMessages.Configuration): Promise<Message.Response> {
    return await this.chatMessagesRepository.list(chatId, config);
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

  // * SEND EMAIL SERVICES
  async sendEmail(
    payload: ChatMessages.TypeWithRelations,
  ): Promise<void> {
    const userId = payload.messages?.[0]?.user_id;
    const messageVisibility = payload.messages?.[0]?.visibility;
    const chatMembers = await this.chatMembersRepository?.list(payload.chat_id, undefined, false, true);
    
    const chatMembersEmails = chatMembers
      ?.filter(member => {
        // Always exclude the sender
        if (member.user_id === userId) return false;
        
        // If message is public, include all members
        if (messageVisibility === 'public') return true;
        
        // If message is internal_agency, only include agency roles
        if (messageVisibility === 'internal_agency') {
          const agencyRoles = ['agency_owner', 'agency_project_manager', 'agency_member'];
          return agencyRoles.includes(member.user.role ?? '');
        }
        
        // Default case (should not happen, but include for safety)
        return true;
      })
      .map(member => member.user.email);


    const senderName = chatMembers?.find(member => member.user_id === userId)?.user.name;


    const chatInfo = await this.chatRepository?.get(payload.chat_id, ['name']);

    if (chatMembersEmails?.length) {
      await Promise.all(
        chatMembersEmails.map(async (email) => {
          await sendChatMessageEmail(email ?? '', senderName ?? '', payload.messages?.[0]?.content ?? '', chatInfo?.name ?? '', userId ?? '');
        })

      );
    }

    return;

  }
}
