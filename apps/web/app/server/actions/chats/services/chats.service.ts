import { MembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { ChatMessagesRepository } from '../../chat-messages/repositories/chat-messages.respository';
import { ChatRepository } from '../repositories/chats.repository';
import { Chats } from '~/lib/chats.types';


export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly membersRepository?: MembersRepository,
    private readonly messagesRepository?: ChatMessagesRepository,
  ) {}

  // * CREATE SERVICES
  async create(payload: Chats.InsertWithRelations): Promise<Chats.Type> {
    const chat = await this.chatRepository.create(payload);


    if (payload.members && payload.members.length > 0) {
      await this.membersRepository.addMembers(
        chat.id.toString(),
        payload.members.map((member) => ({
          user_id: member.user_id,
          role: member.role,
        })),
      );
    }

    return chat;
  }

  // * GET SERVICES
  async list(userId: string): Promise<Chats.Type[]> {
    return await this.chatRepository.list(userId);
  }


  async get(chatId: string): Promise<Chats.TypeWithRelations> {
    return await this.chatRepository.get(chatId);
  }


  // * DELETE SERVICES
  async delete(chatId: string): Promise<void> {
    // ❗ Primero eliminamos los miembros y mensajes del chat antes de eliminarlo
    await this.membersRepository.removeAllMembers(chatId);
    await this.messagesRepository.clearChatMessages({ chat_id: chatId });

    return await this.chatRepository.delete(chatId);
  }


  // * UPDATE SERVICES
  async update(payload: Chats.Update): Promise<Chats.Type> {
    return await this.chatRepository.update(payload);
  }

}
