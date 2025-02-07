import { BaseAction } from '../base-action';
import { ChatMembersController } from './controllers/chat-members.controller';
import {
  AddMembersPayload,
  IChatMembersActions
} from './chat-members.interface';

import { ChatMembers } from '~/lib/chat-members.types';
export class ChatMembersAction extends BaseAction implements IChatMembersActions {
  private controller: ChatMembersController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new ChatMembersController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async upsert(payload: AddMembersPayload): Promise<ChatMembers.TypeWithRelations[]> {
    return await this.controller.upsert(payload);
  }

  async list(chatId: string): Promise<ChatMembers.TypeWithRelations[]> {
    return await this.controller.list(chatId);
  }

  async get(
    chatId: string,
    userId: string,
  ): Promise<ChatMembers.TypeWithRelations> {
    return await this.controller.get(chatId, userId);
  }

  async delete(
    chatId?: string,
    userId?: string,
  ): Promise<void> {
    return await this.controller.delete(chatId, userId);
  }


  async update(
    payload: ChatMembers.Update,
  ): Promise<ChatMembers.TypeWithRelations> {
    return await this.controller.update(payload);
  }

}

export function createChatMembersAction(baseUrl: string) {
  return new ChatMembersAction(baseUrl);
}

