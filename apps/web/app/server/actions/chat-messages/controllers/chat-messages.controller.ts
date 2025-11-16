import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { ChatMessages } from '~/lib/chat-messages.types';
import { ChatMessagesRepository } from '../repositories/chat-messages.respository';
import { MessagesRepository } from '../../messages/repositories/messages.repository';
import { ChatMessagesService } from '../services/chat-messages.service';
import { ChatRepository } from '../../chats/repositories/chats.repository';
import { ChatMembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { Message } from '~/lib/message.types';


export class ChatMessagesController {
  private baseUrl: string
  private client: SupabaseClient<Database>
  private adminClient?: SupabaseClient<Database>

  constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
      this.baseUrl = baseUrl;
      this.client = client;
      this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  async create(
    payload: ChatMessages.InsertWithRelations,
  ): Promise<ChatMessages.TypeWithRelations> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const messagesRepository = new MessagesRepository(this.client, this.adminClient);
      const chatRepository = new ChatRepository(this.client, this.adminClient);
      const chatMembersRepository = new ChatMembersRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository, messagesRepository, chatMembersRepository, chatRepository);
     const chatMessageCreated = await chatMessageService.create(payload)

     chatMessageService.sendEmail(chatMessageCreated).catch(error => {
      console.error('Error sending email:', error);
    });
    
    return chatMessageCreated
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async list(chatId: string | number, config?: ChatMessages.Configuration): Promise<Message.Response> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.list(chatId, config);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async delete(
    chatId?: string,
    messageId?: string,
  ): Promise<void> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.delete(chatId, messageId);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(
    payload: ChatMessages.Update,
  ): Promise<ChatMessages.Type> {
    try {
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);

      const chatMessageService = new ChatMessagesService(chatMessagesRepository);
      return await chatMessageService.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
