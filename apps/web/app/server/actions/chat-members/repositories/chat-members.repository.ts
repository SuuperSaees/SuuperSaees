import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

export class ChatMembersRepository {
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
  async upsert(
    chat_id: string,
    members: { user_id: string; type: string }[],
  ): Promise<{ success: boolean; message: string }> {
    const client = this.adminClient ?? this.client;
    

    const { data: existingMembers, error: fetchError } = await client
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chat_id);
  
    if (fetchError) {
      throw new Error(`Error fetching existing members: ${fetchError.message}`);
    }
  
    const newUserIds = new Set(members.map(m => m.user_id));
    
    const usersToDelete = existingMembers
      ?.filter(m => !newUserIds.has(m.user_id))
      .map((m: { user_id: string }) => m.user_id) || [];

    if (usersToDelete.length > 0) {
      const { error: deleteError } = await client
        .from('chat_members')
        .delete()
        .eq('chat_id', chat_id)
        .in('user_id', usersToDelete);

  
      if (deleteError) {
        throw new Error(`Error removing members: ${deleteError.message}`);
      }
    }

    const membersToUpsert = members.filter(m => !usersToDelete.includes(m.user_id));

    await Promise.all(membersToUpsert.map(async (member) => {
      const { error: upsertError } = await client
        .from('chat_members')
        .insert({
          chat_id,
          user_id: member.user_id,
          type: member.type,
        }
      );


      if (upsertError) {
        throw new Error(`Error updating members: ${upsertError.message}`);
      }
    }));

    return {
      success: true,
      message: `Members successfully synchronized for chat ${chat_id}.`,
    };
  }

  // * GET REPOSITORIES
  async list(chatId: string): Promise<GetMembersResponse[]> {
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

  async get(
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
  async delete({
    chat_id,
    user_id,
  }: {
    chat_id?: string;
    user_id?: string;
  }): Promise<void> {
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
  }
  }

  // * UPDATE REPOSITORIES
  async update(
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
}
