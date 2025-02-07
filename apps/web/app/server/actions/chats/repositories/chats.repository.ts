import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { Chats } from '~/lib/chats.types';

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
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }

    return data as Chats.Type;
  }

  // * GET REPOSITORIES
  async list(userId: string, chatIds?: string[]): Promise<Chats.Type[]> {
    const client = this.adminClient ?? this.client;
    let chatList: Chats.Type[] = [];
    const { data, error } = await client
    .from('chats')
    .select(`*`)
    .eq('user_id', userId)
    .is('deleted_on', null);

    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    chatList = chatList.concat(data as unknown as Chats.Type[]);  


    if (chatIds) {
      const { data: chatMembers, error: membersError } = await client
      .from('chats')
      .select(`*`)
      .in('id', chatIds)
      .is('deleted_on', null);

      if (membersError) {
        throw new Error(`Error fetching chats as members: ${membersError.message}`);
      }

      chatList = chatList.concat(chatMembers as unknown as Chats.Type[]);
    }
    return chatList;

  }
 

  async get(chatId: string): Promise<Chats.TypeWithRelations> {
    const client = this.adminClient ?? this.client;

    const { data: chat, error } = await client
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
        chat_members (
          user_id,
          type,
          account:accounts!inner (
            email,
            user_settings (
              name,
              picture_url
            )
          )

        ),
        messages (
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
            user:accounts(email, user_settings(name, picture_url))
        )
      `,
      )
      .eq('id', chatId)
      // is deleted_on null but for messages
      .is('messages.deleted_on', null)
      .single();


    if (error) {
      throw new Error(`Error fetching chat ${chatId}: ${error.message}`);
    }
    if (!chat) {
      throw new Error(`Chat ${chatId} not found`);
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
        id: member.user_id,
        settings: {},
        type: member.type,
        updated_at: new Date().toISOString(),
        user_id: member.user_id,
        visibility: true
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
          name: message.user?.user_settings?.name ?? '',
          email: message.user?.email ?? '',
          picture_url: message.user?.user_settings?.picture_url ?? '',



        },
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
