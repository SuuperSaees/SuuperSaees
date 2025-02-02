import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import {
  ChatPayload,
  ChatResponse,
  DeleteChatResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
} from '../chat.interface';

export class ChatRepository {
  private client: SupabaseClient;
  private adminClient?: SupabaseClient;

  constructor(
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
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

    return data as ChatResponse;
  }

  // * GET REPOSITORIES
  async getChats(): Promise<GetChatsResponse[]> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client.from('chats').select(`
        id,
        name,
        user_id,
        settings,
        visibility,
        image,
        created_at,
        chat_members (user_id)
      `);

    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    return (data || []).map((chat) => ({
      id: chat.id,
      name: chat.name,
      user_id: chat.user_id,
      settings: chat.settings,
      visibility: chat.visibility,
      image: chat.image,
      created_at: chat.created_at,
      members_count: chat.chat_members?.length || 0,
    })) as GetChatsResponse[];
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
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
          role
        ),
        chat_messages (
          id,
          user_id,
          content,
          role,
          created_at
        )
      `,
      )
      .eq('id', chatId)
      .single();

    if (error) {
      throw new Error(`Error fetching chat ${chatId}: ${error.message}`);
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
      members: chat.chat_members || [],
      messages: chat.chat_messages || [],
    } as GetChatByIdResponse;
  }

  // * DELETE REPOSITORIES
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    const client = this.adminClient ?? this.client;
    const { error } = await client.from('chats').delete().eq('id', chatId);

    if (error) {
      throw new Error(`Error deleting chat ${chatId}: ${error.message}`);
    }

    return { success: true, message: `Chat ${chatId} successfully deleted.` };
  }

  // * UPDATE REPOSITORIES
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('chats')
      .update({ settings: payload.settings })
      .eq('id', payload.chat_id);

    if (error) {
      throw new Error(
        `Error updating chat settings for ${payload.chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Chat settings updated successfully for ${payload.chat_id}.`,
    };
  }
}
