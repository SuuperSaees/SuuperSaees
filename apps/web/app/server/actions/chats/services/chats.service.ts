import { ChatMembersRepository } from '../../chat-members/repositories/chat-members.repository';
import { ChatMessagesRepository } from '../../chat-messages/repositories/chat-messages.respository';
import { ChatRepository } from '../repositories/chats.repository';
import { Chats } from '~/lib/chats.types';
import { TeamRepository } from '../../team/repositories/team.repository';
import { Members } from '~/lib/members.types';

export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatMembersRepository?: ChatMembersRepository,
    private readonly chatMessagesRepository?: ChatMessagesRepository,
    private readonly teamRepository?: TeamRepository,

  ) {}


  // * CREATE SERVICES
  async create(payload: Chats.InsertWithRelations): Promise<Chats.Type> {
    const createdChat = await this.chatRepository.create({
      name: payload.name,
      user_id: payload.user_id,
      visibility: payload.visibility,
      image: payload.image,
      settings: payload.settings,
      client_organization_id: payload.client_organization_id,
      agency_id: payload.agency_id,
    });

    if (payload.chat_members && payload.chat_members.length > 0) {
      await this.chatMembersRepository?.upsert(
        createdChat.id.toString(),
        payload.chat_members.map((member) => ({
          user_id: member.user_id,
          type: member.type ?? 'guest',
          visibility: member.visibility ?? true,
        })),
      );
    }
    return createdChat;
  }

  // * GET SERVICES
  async list(userId: string): Promise<Chats.TypeWithRelations[]> {
    const chatsResult = await this.chatMembersRepository?.list(undefined, userId, true);

    const chatIds = chatsResult?.map((chat) => chat.chat_id);

    const chats = await this.chatRepository.list(userId, chatIds);

    const clientOrganizationIdsAndAgencyIds = chats?.map((chat) => chat?.client_organization_id ?? '') 
      .concat(chats?.map((chat) => chat?.agency_id ?? ''));

    const organizationsIds = [...new Set(clientOrganizationIdsAndAgencyIds)];

    const [teamResult, lastMessages] = await Promise.all([
      this.teamRepository?.list({ 
        organizationIds: organizationsIds, 
        includeMembers: false, 
        includeAgency: false 
      }),
      this.chatMessagesRepository?.listLastMessages(chatIds)
    ]);

    const chatsSorted = chats
      .map(chat => {
        const organizations = organizationsIds
          .filter(orgId => orgId === chat.client_organization_id || orgId === chat.agency_id)
          .map(orgId => teamResult?.[orgId ?? ''])
          .filter(Boolean) as Members.Organization[];

  
        const lastMessage = lastMessages?.find(msg => msg.chat_id === chat.id)?.messages ?? [];
        const messages = Array.isArray(lastMessage) ? lastMessage : [lastMessage];
  
        return {
          ...chat,
          organizations,
          messages
        };
      })
      .sort((a, b) => {
        const bDate = b.messages?.[0]?.created_at ?? b.created_at;
        const aDate = a.messages?.[0]?.created_at ?? a.created_at;
        return (!bDate || !aDate) ? 0 : new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  
    return chatsSorted;
  }


  async get(chatId: string, fetchLatest?: Chats.FetchLatest): Promise<Chats.TypeWithRelations> {
    return await this.chatRepository.get(chatId, fetchLatest);
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
