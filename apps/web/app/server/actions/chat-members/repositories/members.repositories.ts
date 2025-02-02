import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

import { ChatRoleType } from '../../chats/middleware/validate_chat_role';
import {
  GetMembersResponse,
  MemberSettingsResponse,
  UpdateMemberSettingsPayload,
  UpdateMemberSettingsResponse,
  UpdateMemberVisibilityPayload,
} from '../members.interface';

export class MembersRepository {
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
  async addMembers(
    chat_id: string,
    members: { user_id: string; role: string }[],
  ): Promise<{ success: boolean; message: string }> {
    const client = this.adminClient ?? this.client;
    const { error } = await client.from('chat_members').upsert(
      members.map((member) => ({
        chat_id,
        user_id: member.user_id,
        role: member.role,
      })),
    );

    if (error) {
      throw new Error(
        `Error adding members to chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Members successfully added to chat ${chat_id}.`,
    };
  }

  // * GET REPOSITORIES
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('chat_members')
      .select('user_id, role, settings, created_at')
      .eq('chat_id', chatId);

    if (error) {
      throw new Error(
        `Error fetching members for chat ${chatId}: ${error.message}`,
      );
    }

    return (data || []).map((member) => ({
      user_id: member.user_id,
      role: member.role as ChatRoleType,
      settings: member.settings || {},
      joined_at: member.created_at,
    })) as GetMembersResponse[];
  }

  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('chat_members')
      .select('user_id, chat_id, settings')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(
        `Error fetching settings for member ${userId} in chat ${chatId}: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        `Member settings not found for user ${userId} in chat ${chatId}.`,
      );
    }

    return {
      user_id: data.user_id,
      chat_id: data.chat_id,
      settings: data.settings,
    };
  }

  // * DELETE REPOSITORIES
  async removeMember(
    chat_id: string,
    user_id: string,
  ): Promise<{ success: boolean; message: string }> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('chat_members')
      .delete()
      .eq('chat_id', chat_id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(
        `Error removing member ${user_id} from chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Member ${user_id} successfully removed from chat ${chat_id}.`,
    };
  }

  async resetMemberSettings(
    chat_id: string,
    user_id: string,
  ): Promise<{ success: boolean; message: string }> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('chat_members')
      .update({ settings: {} })
      .eq('chat_id', chat_id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(
        `Error resetting settings for member ${user_id} in chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Settings for member ${user_id} in chat ${chat_id} reset successfully.`,
    };
  }

  async removeAllMembers(
    chat_id: string,
  ): Promise<{ success: boolean; message: string }> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('chat_members')
      .delete()
      .eq('chat_id', chat_id);
    if (error) {
      throw new Error(
        `Error removing all members from chat ${chat_id}: ${error.message}`,
      );
    }
    return {
      success: true,
      message: `All members removed from chat ${chat_id}.`,
    };
  }

  // * UPDATE REPOSITORIES
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    const client = this.adminClient ?? this.client;
    const { chat_id, user_id, settings } = payload;

    const { error } = await client
      .from('chat_members')
      .update({ settings })
      .eq('chat_id', chat_id)
      .eq('user_id', user_id);

    if (error) {
      throw new Error(
        `Error updating settings for member ${user_id} in chat ${chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Settings for member ${user_id} successfully updated in chat ${chat_id}.`,
    };
  }

  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<{ success: boolean; message: string }> {
    const client = this.adminClient ?? this.client;
    const { error } = await client
      .from('chat_members')
      .update({ visibility: payload.visibility })
      .eq('chat_id', payload.chat_id)
      .eq('user_id', payload.user_id);

    if (error) {
      throw new Error(
        `Error updating visibility for member ${payload.user_id} in chat ${payload.chat_id}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Visibility for member ${payload.user_id} successfully updated in chat ${payload.chat_id}.`,
    };
  }
}
