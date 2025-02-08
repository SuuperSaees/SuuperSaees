import {
  AddMembersPayload,
} from '../chat-members.interface';
import { ChatMembersRepository } from '../repositories/chat-members.repository';
import { ChatMembers } from '~/lib/chat-members.types';

export class ChatMembersService {
  constructor(private readonly membersRepository: ChatMembersRepository) {}


  // * CREATE SERVICES
  async upsert(payload: AddMembersPayload): Promise<ChatMembers.TypeWithRelations[]> {
    return await this.membersRepository.upsert(
      payload.chat_id,
      payload.members,
    );
  }

  // * GET SERVICES
  async list(chatId: string): Promise<ChatMembers.TypeWithRelations[]> {
    return await this.membersRepository.list(chatId);
  }


  async get(
    chatId: string,
    userId: string,
  ): Promise<ChatMembers.TypeWithRelations> {
    return await this.membersRepository.get(chatId, userId);
  }


  // * DELETE SERVICES
  async delete(
    chatId?: string,
    userId?: string,
  ): Promise<void> {
    return await this.membersRepository.delete({
      chat_id: chatId,
      user_id: userId,
    });
  }



  // * UPDATE SERVICES
  async update(
    payload: ChatMembers.Update,

  ): Promise<ChatMembers.TypeWithRelations> {
    return await this.membersRepository.update(payload);
  }
}

