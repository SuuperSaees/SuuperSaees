import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { Chats } from '~/lib/chats.types';

export class ChatRepository {
  private client: SupabaseClient;
  private adminClient?: SupabaseClient;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(payload: ChatPayload): Promise<Chats.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client

      .from('chats')
      .insert({
        name: payload.name,
        user_id: payload.user_id,
        settings: payload.settings ?? {},
        visibility: payload.visibility,
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

  async list(userId: string): Promise<Chats.Type[]> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
    .from('chats')
    .select(`*`)
    .eq('user_id', userId)
    .is('deleted_on', null);


    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    return data as Chats.Type[];
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
          type
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
            user:user_settings (
              id,
              name,
              picture_url,
              email:accounts(email)
          )
          *,
          user:accounts(id, name, email, picture_url)
        )
      `,
      )

      .eq('id', chatId)
      .single();


    if (error) {
      throw new Error(`Error fetching chat ${chatId}: ${error.message}`);
    }

    const membersIds = chat.chat_members?.map((member) => member.user_id as string);

    const { data: members, error: membersError } = await client
      .from('user_settings')
      .select('user_id, name, picture_url, email:accounts(email)')
      .in('user_id', membersIds);


    if (membersError) {
      throw new Error(`Error fetching members: ${membersError.message}`);
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
      chat_members: chat.chat_members?.map((member) => ({
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
      messages: chat.messages || [],
    } 
  }



  // * DELETE REPOSITORIES
  async delete(chatId: string): Promise<DeleteChatResponse> {
    const client = this.adminClient ?? this.client;
    const { error } = await client.from('chats').delete().eq('id', chatId);

    if (error) {
      throw new Error(`Error deleting chat ${chatId}: ${error.message}`);
    }

    return { success: true, message: `Chat ${chatId} successfully deleted.` };
  }

  // * UPDATE REPOSITORIES
  async update(payload: Chats.Update): Promise<Chats.Type> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client.from('chats').update(payload).eq('id', payload.id).select().single();

    if (error) {
      throw new Error(`Error updating chat ${payload.id}: ${error.message}`);
    }

    return data as Chats.Type;
  }
}
