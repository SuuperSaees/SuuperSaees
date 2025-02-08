import { ChatMembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { ChatMessagesRepository } from '../../chat-messages/repositories/chat-messages.respository';
import { ChatRepository } from '../repositories/chats.repository';
import { Chats } from '~/lib/chats.types';


export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatMembersRepository?: ChatMembersRepository,
    private readonly chatMessagesRepository?: ChatMessagesRepository,
  ) {}


  // * CREATE SERVICES
  async create(payload: Chats.InsertWithRelations): Promise<Chats.Type> {
    const createdChat = await this.chatRepository.create({
      name: payload.name,
      user_id: payload.user_id,
      visibility: payload.visibility,
      image: payload.image,
      settings: payload.settings,
    });

    if (payload.chat_members && payload.chat_members.length > 0) {
      await this.chatMembersRepository?.upsert(
        createdChat.id.toString(),
        payload.chat_members.map((member) => ({
          user_id: member.user_id,
          type: member.type ?? 'guest',
        })),
      );
    }
    return createdChat;
  }

  // * GET SERVICES
  async list(userId: string): Promise<Chats.Type[]> {
    const chatsResult = await this.chatMembersRepository?.list(undefined, userId);

    const chatIds = chatsResult?.map((chat) => chat.chat_id);

    return await this.chatRepository.list(userId, chatIds);
  }



  async get(chatId: string): Promise<Chats.TypeWithRelations> {
    return await this.chatRepository.get(chatId);
  }


  // * DELETE SERVICES
  async delete(chatId: string): Promise<void> {
    // ❗ First we delete the members and messages of the chat before deleting it
    await Promise.all([
      this.chatMembersRepository?.delete({
        chat_id: chatId,
      }),
      this.chatMessagesRepository?.delete({ chat_id: chatId })
    ]);

    return await this.chatRepository.delete(chatId);
  }

  // * UPDATE SERVICES
  async update(payload: Chats.Update): Promise<Chats.Type> {
    return await this.chatRepository.update(payload);
  }

}
