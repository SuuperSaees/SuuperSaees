import { MembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { MessagesRepository } from '../../chat-messages/repositories/chat-messages.respository';
import {
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
} from '../chats.interface';
import { ChatRepository } from '../repositories/chats.repository';
import { Chats } from '~/lib/chats.types';


export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly membersRepository: MembersRepository,
    private readonly messagesRepository: MessagesRepository,
  ) {}

  // * CREATE SERVICES
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    const chat = await this.chatRepository.createChat(payload);

    if (payload.members && payload.members.length > 0) {
      await this.membersRepository.addMembers(
        chat.id,
        payload.members.map((member) => ({
          user_id: member.user_id,
          role: member.role,
        })),
      );
    }

    return chat;
  }

  // * GET SERVICES
  async getChats(): Promise<Chats.Type[]> {
    return await this.chatRepository.getChats();
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    return await this.chatRepository.getChatById(chatId);
  }

  // * DELETE SERVICES
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    // ❗ Primero eliminamos los miembros y mensajes del chat antes de eliminarlo
    await this.membersRepository.removeAllMembers(chatId);
    await this.messagesRepository.clearChatMessages({ chat_id: chatId });

    return await this.chatRepository.deleteChat(chatId);
  }

  // * UPDATE SERVICES
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    return await this.chatRepository.updateChatSettings(payload);
  }

  async updateChat(payload: Chats.Update): Promise<Chats.Type> {
    return await this.chatRepository.updateChat(payload);
  }
}
