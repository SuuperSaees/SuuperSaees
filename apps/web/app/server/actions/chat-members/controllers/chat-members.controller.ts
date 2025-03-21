import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import {
  AddMembersPayload,
} from '../chat-members.interface';
import { ChatMembers } from '~/lib/chat-members.types';

import { ChatMembersRepository } from '../repositories/chat-members.repository';
import { ChatMembersService } from '../services/chat-members.service';

export class ChatMembersController {
  private membersService: ChatMembersService;

  constructor(
    baseUrl: string,
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    const membersRepository = new ChatMembersRepository(client, adminClient);
    this.membersService = new ChatMembersService(membersRepository);
  }


  // * CREATE CONTROLLERS
  async upsert(payload: AddMembersPayload): Promise<ChatMembers.TypeWithRelations[]> {
    try {
      return await this.membersService.upsert(payload);
    } catch (error) {

      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async list(chatId: string): Promise<ChatMembers.TypeWithRelations[]> {
    try {
      return await this.membersService.list(chatId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async get(
    chatId: string,
    userId: string,
  ): Promise<ChatMembers.TypeWithRelations> {
    try {
      return await this.membersService.get(chatId, userId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async delete(
    chatId?: string,
    userId?: string,
  ): Promise<void> {
    try {
      return await this.membersService.delete(chatId, userId);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async update(
    payload: ChatMembers.Update,
  ): Promise<ChatMembers.TypeWithRelations> {
    try {
      return await this.membersService.update(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
