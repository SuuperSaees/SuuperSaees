import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import { ChatMembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { ChatMessagesRepository } from '../../chat-messages/repositories/chat-messages.respository';
import { ChatRepository } from '../repositories/chats.repository';
import { ChatService } from '../services/chats.service';
import { Chats } from '~/lib/chats.types';
import { TeamRepository } from '../../team/repositories/team.repository';

export class ChatController {
  private baseUrl: string
  private client: SupabaseClient<Database>
  private adminClient?: SupabaseClient<Database>

  constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
      this.baseUrl = baseUrl;
      this.client = client;
      this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  async create(payload: Chats.InsertWithRelations): Promise<Chats.Type> {
    try {
      const chatRepository = new ChatRepository(this.client, this.adminClient);
      const membersRepository = new ChatMembersRepository(this.client, this.adminClient);
      const chatService = new ChatService(chatRepository, membersRepository);
      return await chatService.create(payload);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  // * GET CONTROLLERS
  async list(userId: string): Promise<Chats.TypeWithRelations[]> {
    try {
      const chatRepository = new ChatRepository(this.client, this.adminClient);
      const membersRepository = new ChatMembersRepository(this.client, this.adminClient);
      const teamRepository = new TeamRepository(this.client, this.adminClient);
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatService = new ChatService(chatRepository, membersRepository, chatMessagesRepository, teamRepository);
      return await chatService.list(userId);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get(chatId: string, fetchLatest?: Chats.FetchLatest): Promise<Chats.TypeWithRelations> {
    try {
      const chatRepository = new ChatRepository(this.client, this.adminClient);
      const membersRepository = new ChatMembersRepository(this.client, this.adminClient);
      const chatMessagesRepository = new ChatMessagesRepository(this.client, this.adminClient);
      const chatService = new ChatService(chatRepository, membersRepository, chatMessagesRepository);
      return await chatService.get(chatId, fetchLatest);

    } catch (error) {


      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async delete(chatId: string): Promise<void> {
    try {
      const chatRepository = new ChatRepository(this.client, this.adminClient);
      const chatService = new ChatService(chatRepository);
      return await chatService.delete(chatId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  // * UPDATE CONTROLLERS
  async update(payload: Chats.Update): Promise<Chats.Type> {
    try {
      const chatRepository = new ChatRepository(this.client, this.adminClient);
      const chatService = new ChatService(chatRepository);
      return await chatService.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}
