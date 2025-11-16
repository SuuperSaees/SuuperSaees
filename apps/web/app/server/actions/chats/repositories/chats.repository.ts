import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { Chats } from '~/lib/chats.types';
import { AccountRoles } from '~/lib/account.types';
import { getSession } from '../../accounts/accounts.action';

export class ChatRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;


  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(payload: Chats.Insert): Promise<Chats.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client

      .from('chats')
      .insert({
        name: payload.name,
        user_id: payload.user_id,
        settings: payload.settings ?? {},
        visibility: payload.visibility ?? true,
        image: payload.image ?? null,
        client_organization_id: payload.client_organization_id ?? null,
        agency_id: payload.agency_id ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }

    return data as Chats.Type;
  }

  // * GET REPOSITORIES
  async list(userId: string, chatIds?: string[]): Promise<Chats.TypeWithRelations[]> {
    const sessionData = await getSession();
    
    const isClient = AccountRoles.clientRoles.has(sessionData?.organization?.role ?? '');

    const client = this.adminClient ?? this.client;

    let chatList: Chats.Type[] = [];

    if (chatIds) {
      const query = client
      .from('chats')
      .select(`*, members:chat_members(user:accounts(*))`)
      .in('id', chatIds)
      .is('deleted_on', null);

      if (isClient) {
        const { data: chatMembers, error: membersError } = await query
        .eq('agency_id', sessionData?.agency?.id ?? '');

        if (membersError) {
          throw new Error(`Error fetching chats as members: ${membersError.message}`);
        }

        chatList = chatList.concat(chatMembers as unknown as Chats.Type[]);
      } else {
        const { data: chatMembers, error: membersError } = await query

      if (membersError) {
        throw new Error(`Error fetching chats as members: ${membersError.message}`);
      }

        chatList = chatList.concat(chatMembers as unknown as Chats.Type[]);
      }
    }
    
    const query = client  
    .from('chats')
    .select(`*`)
    .eq('user_id', userId)
    .is('deleted_on', null);

    if (isClient) {
      const { data, error } = await query
      .eq('agency_id', sessionData?.agency?.id ?? '');


    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    chatList = chatList.concat(data.filter((chat) => !chatIds?.includes(chat.id)) as unknown as Chats.Type[]);  

    return chatList;
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    chatList = chatList.concat(data.filter((chat) => !chatIds?.includes(chat.id)) as unknown as Chats.Type[]);  

    return chatList;
  }
 

  async get(chatId: string, fetchLatest?: Chats.FetchLatest, fields?: string[] ): Promise<Chats.TypeWithRelations> {
    const client = this.client;
    
    if (fields){
      const { data: chat, error } = await client
      .from('chats')
      .select(fields.join(','))
      .eq('id', chatId)
      .single();
      
      if (error) {
        throw new Error(`Error fetching chat ${chatId}: ${error.message}`);
      }

      return chat as unknown as Chats.TypeWithRelations;
    }

    let baseQuery = client
    .from('chats')
    .select(
      `
      id,
      name,
      user_id,
      settings,
      visibility,
      image,
      created_at,
      updated_at,
      deleted_on,
      agency_id,
      client_organization_id,
      chat_members (
        user_id,
        type,
        visibility,
        account:accounts(
          email,
          name,
          picture_url,
          user_settings (
            name,
            picture_url
          )
        )

      ),
      messages!chat_id (
          id,
          user_id,
          content,
          created_at,
          updated_at,
          deleted_on,
          type,
          visibility,
          temp_id,
          order_id,
          parent_id,
          user:accounts(email, name, picture_url, user_settings(name, picture_url)),
          files (
            id,
            name,
            size,
            type,
            url,
            temp_id
          )
      )
    `,
    ).is('deleted_on', null)
    .is('messages.deleted_on', null)

    if (fetchLatest) {
      // Find the chat with the most recent message using the specific relationship
      let messagesQuery = client
        .from('messages')
        .select('chat_id, created_at, chats!messages_chat_id_fkey(agency_id, client_organization_id)')
        .is('deleted_on', null)
        .is('chats.deleted_on', null);

      if (fetchLatest.scope === 'client') {
        messagesQuery = messagesQuery
          .eq('chats.client_organization_id', fetchLatest.clientOrganizationId ?? '')
          .eq('chats.agency_id', fetchLatest.agencyId ?? '');
      } else {
        messagesQuery = messagesQuery.eq('chats.agency_id', fetchLatest.agencyId ?? '');
      }

      const { data: messages, error: messagesError } = await messagesQuery
        .order('created_at', { ascending: false })
        .limit(1);

      if (messagesError) {
        throw new Error(`Error finding latest message: ${messagesError.message}`);
      }

      if (messages && messages.length > 0 && messages[0]?.chat_id) {
        // Get the chat with the latest message
        baseQuery = baseQuery.eq('id', messages[0].chat_id);
      } else {
        // No messages found, fall back to latest chat by creation date
        baseQuery = baseQuery.order('created_at', { ascending: false });
        if (fetchLatest.scope === 'client') {
          baseQuery = baseQuery
            .eq('client_organization_id', fetchLatest.clientOrganizationId ?? '')
            .eq('agency_id', fetchLatest.agencyId ?? '');
        } else {
          baseQuery = baseQuery.eq('agency_id', fetchLatest.agencyId ?? '');
        }
        baseQuery = baseQuery.limit(1);
      }
    } else {
      baseQuery = baseQuery.eq('id', chatId);
    }

    const { data: chat, error } = await baseQuery.single();

    if (error) {
      throw new Error(`Error fetching chat ${chatId}: ${error.message}`);
    }
    if (!chat) {
      throw new Error(`Chat ${chatId} not found`);
    }

    const agencyId = chat.agency_id ?? '';
    const clientOrganizationId = chat.client_organization_id ?? '';

    const { data: agencyMembers, error: agencyMembersError } = await this.client
    .from('accounts_memberships')
    .select('user_id')
    .eq('organization_id', agencyId);

    if (agencyMembersError) {
      throw new Error(`Error fetching agency members: ${agencyMembersError.message}`);
    }

    return {
      id: chat.id,
      name: chat.name,
      user_id: chat.user_id,
      settings: chat.settings,
      visibility: chat.visibility,
      image: chat.image,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      deleted_on: chat.deleted_on,
      reference_id: chat.id,
      members: chat.chat_members?.map((member) => ({
        chat_id: chatId,
        created_at: new Date().toISOString(),
        deleted_on: null,
        organization_id: agencyMembers.find((agencyMember) => agencyMember.user_id === member.user_id) ? agencyId : clientOrganizationId,
        id: member.user_id,
        name: Array.isArray(member.account?.user_settings) ? member.account?.user_settings[0]?.name ?? member.account?.name ?? '' : member.account?.user_settings?.name ?? member.account?.name ?? '',
        picture_url: Array.isArray(member.account?.user_settings) ? member.account?.user_settings[0]?.picture_url ?? member.account?.picture_url ?? '' : member.account?.user_settings?.picture_url ?? member.account?.picture_url ?? '',
        email: member.account?.email ?? '',
        settings: {},
        type: member.type,
        updated_at: new Date().toISOString(),

        user_id: member.user_id,
        visibility: member.visibility

      })) || [],
      messages: chat?.messages?.map((message) => ({
        id: message.id,
        user_id: message.user_id,
        content: message.content,
        created_at: message.created_at,
        updated_at: message.updated_at,
        deleted_on: message.deleted_on,

        type: message.type,
        visibility: message.visibility,
        temp_id: message.temp_id,
        order_id: message.order_id,
        parent_id: message.parent_id,
        user: {
          id: message.user_id,
          name: Array.isArray(message.user?.user_settings) ? message.user?.user_settings[0]?.name ?? message.user?.name ?? '' : message.user?.user_settings?.name ?? message.user?.name ?? '',
          email: message.user?.email ?? '',
          picture_url: Array.isArray(message.user?.user_settings) ? message.user?.user_settings[0]?.picture_url ?? message.user?.picture_url ?? '' : message.user?.user_settings?.picture_url ?? message.user?.picture_url ?? '',
        },
        files: message.files
      })),
    } 

  }


  // * DELETE REPOSITORIES
  async delete(chatId: string): Promise<void> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
    .from('chats')
    .update({ deleted_on: new Date().toISOString() })
    .eq('id', chatId);

    if (error) {
      throw new Error(`Error deleting chat ${chatId}: ${error.message}`);
    }

    return;
  }

  // * UPDATE REPOSITORIES
  async update(payload: Chats.Update): Promise<Chats.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
    .from('chats')
    .update(payload)
    .eq('id', payload.id ?? '')
    .select()
    .single();
    if (error) {
      throw new Error(`Error updating chat ${payload.id}: ${error.message}`);
    }

    return data as Chats.Type;
  }
}
