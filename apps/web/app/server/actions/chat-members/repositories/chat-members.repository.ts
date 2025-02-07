import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { ChatMembers } from '~/lib/chat-members.types';

export class ChatMembersRepository {
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
  async upsert(
    chat_id: string,
    members: { user_id: string; type: string }[],
  ): Promise<ChatMembers.TypeWithRelations[]> {
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

    const upsertedMembers: ChatMembers.TypeWithRelations[] = [];

    await Promise.all(membersToUpsert.map(async (member) => {
      const { data: upsertedMember, error: upsertError} = await client
        .from('chat_members')

        .insert({
          chat_id,
          user_id: member.user_id,
          type: member.type,
        }
      )
      .select('*, user:accounts(email, settings:user_settings(name, picture_url))')
      .single();

      if (upsertedMembers.length > 0) {
        upsertedMembers.push({
          ...upsertedMember,
          user: {
            id: upsertedMember.user.id,
            email: upsertedMember.user.email,
            name: upsertedMember.user.settings?.name,
            picture_url: upsertedMember.user.settings?.picture_url,
          },
        });
      }
      if (upsertError) {
        throw new Error(`Error updating members: ${upsertError.message}`);
      }
    }));

    return upsertedMembers;
  }

  // * GET REPOSITORIES
  async list(chatId: string, userId?: string): Promise<ChatMembers.TypeWithRelations[]> {
    const client = this.adminClient ?? this.client;

    if(userId) {
      const { data, error } = await client
        .from('chat_members')
        .select(`*, user:accounts(email, settings:user_settings(name, picture_url))`)
        .eq('user_id', userId);

      if (error) {
        throw new Error(
          `Error fetching members for chat ${chatId} and user ${userId}: ${error.message}`,
        );
      }

      return data as ChatMembers.TypeWithRelations[];
    }

    const { data, error } = await client
      .from('chat_members')
      .select(`*, user:accounts(email, settings:user_settings(name, picture_url))`)
      .eq('chat_id', chatId);

    if (error) {
      throw new Error(
        `Error fetching members for chat ${chatId}: ${error.message}`,
      );
    }

    const members = data.map((member: ChatMembers.TypeWithRelations) => ({
      ...member,
      user: {
        id: member.user.id,
        email: member.user.email,
        name: member.user.settings?.name,
        picture_url: member.user.settings?.picture_url,
      },
    })) as ChatMembers.TypeWithRelations[];


    return members;
  }

  async get(
    chatId: string,
    userId: string,
  ): Promise<ChatMembers.TypeWithRelations> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('chat_members')
      .select(`*, user:accounts(email, settings:user_settings(name, picture_url))`)
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

    const member = {
      ...data,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.settings?.name,
        picture_url: data.user.settings?.picture_url,
      },
    }
    return member as ChatMembers.TypeWithRelations;
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
    const baseQuery = client
      .from('chat_members')
      .update({ deleted_on: new Date().toISOString() });

    try {
      if (chat_id && user_id) {
        const { error } = await baseQuery
          .eq('chat_id', chat_id)
          .eq('user_id', user_id);
          
        if (error) throw error;
        return;
      }

      if (chat_id) {
        const { error } = await baseQuery.eq('chat_id', chat_id);
        if (error) throw error;
        return;
      }

      if (user_id) {
        const { error } = await baseQuery.eq('user_id', user_id);
        if (error) throw error;
        return;
      }
    } catch (error: unknown) {
      const context = chat_id && user_id
        ? `member ${user_id} from chat ${chat_id}`
        : chat_id

          ? `members from chat ${chat_id}`
          : `member ${user_id}`;

      throw new Error(`Error removing ${context}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // * UPDATE REPOSITORIES
  async update(
    payload: ChatMembers.Update,
  ): Promise<ChatMembers.TypeWithRelations> {
    const client = this.adminClient ?? this.client;
    const { chat_id, user_id } = payload;


    const { data, error } = await client
      .from('chat_members')
      .update(payload)
      .eq('chat_id', chat_id)
      .eq('user_id', user_id)
      .select('*, user:accounts(email, settings:user_settings(name, picture_url))')
      .single();


    if (error) {
      throw new Error(
        `Error updating settings for member ${user_id} in chat ${chat_id}: ${error.message}`,
      );
    }

    const member = {
      ...data,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.settings?.name,
        picture_url: data.user.settings?.picture_url,
      },
    }

    return member as ChatMembers.TypeWithRelations;
  }
}
