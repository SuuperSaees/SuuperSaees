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
    members: { user_id: string; type: string, visibility: boolean, role: string | undefined }[],
  ): Promise<ChatMembers.TypeWithRelations[]> {
    const client = this.adminClient ?? this.client;

    // Remove any duplicate user_ids, keeping the last occurrence
    const uniqueMembers = [...new Map(members.map(m => [m.user_id, m])).values()];

    const { data: existingMembers, error: fetchError } = await client
      .from('chat_members')
      .select('user_id, type, visibility')
      .eq('chat_id', chat_id);
  
    if (fetchError) {
      throw new Error(`Error fetching existing members: ${fetchError.message}`);
    }

    // Extract existing IDs and create a map for easy lookup
    const existingIds = existingMembers?.map(m => m.user_id) || [];
    const existingMembersMap = new Map(
      existingMembers?.map(m => [m.user_id, m]) || []
    );

    // Determine which members to add and which to update
    const idsToAdd = uniqueMembers.filter(m => !existingIds.includes(m.user_id));
    const idsToUpdate = uniqueMembers.filter(m => {
      const existing = existingMembersMap.get(m.user_id);
      return existing && (existing.type !== m.type || existing.visibility !== m.visibility);
    });

    // Delete members that are not in the new list
    const usersToDelete = existingIds.filter(
      id => !uniqueMembers.some(m => m.user_id === id)
    );

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

    // Prepare data for members that need to be added or updated
    const upsertData = [...idsToAdd, ...idsToUpdate].map(member => ({
      chat_id,
      user_id: member.user_id,
      type: member.type as "project_manager" | "assistant" | "owner" | "guest",
      visibility: member.visibility,
    }));

    let upsertedMembers: ChatMembers.TypeWithRelations[] = [];

    if (upsertData.length > 0) {
      const { data: upsertedData, error: upsertError } = await client
        .from('chat_members')
        .upsert(upsertData, { onConflict: 'chat_id,user_id' })
        .select('*, user:accounts(email, settings:user_settings(name, picture_url))');

      if (upsertError) {
        throw new Error(`Error upserting members: ${upsertError.message}`);
      }

      // Transform the upserted data
      upsertedMembers = (upsertedData || []).map(member => ({
        ...member,
        user: {
          id: member.user_id ?? '',
          email: member.user?.email ?? '',
          name: member.user?.settings?.name ?? '',
          picture_url: member.user?.settings?.picture_url ?? '',
        },
      }));
    }

    return upsertedMembers;
  }

  // * GET REPOSITORIES
  async list(chatId?: string, userId?: string, getAllMembers= false, includeRoles = false): Promise<ChatMembers.TypeWithRelations[]> {
    const client = this.adminClient ?? this.client;

    if(userId && !chatId	) {
      const { data, error } = await client
        .from('chat_members')
        .select(`*, user:accounts(email, settings:user_settings(name, picture_url))`)
        .eq('user_id', userId);

      if (error) {
        throw new Error(
          `Error fetching members for chat ${chatId} and user ${userId}: ${error.message}`,
        );
      }

      if(getAllMembers && data.length) {
        const chatIds = data.map((chat) => chat.chat_id);

        const { data: allMembers, error: allMembersError } = await client
          .from('chat_members')
          .select(`*, user:accounts(email, settings:user_settings(name, picture_url))`)
          .in('chat_id', chatIds);

        if (allMembersError) {
          throw new Error(
            `Error fetching all members for chat ${chatId}: ${allMembersError.message}`,
          );
        }

        return data.concat(allMembers) as ChatMembers.TypeWithRelations[];
      }

      return data as ChatMembers.TypeWithRelations[];

    }

    const { data, error } = await client
      .from('chat_members')
      .select(`*, user:accounts(email, settings:user_settings(name, picture_url))`)
      .eq('chat_id', chatId ?? '');


    if (error) {
      throw new Error(
        `Error fetching members for chat ${chatId}: ${error.message}`,
      );
    }
    let roles: { user_id: string, role: string }[] | undefined = undefined
    if(includeRoles) {
      const { data: rolesData, error: rolesError } = await client
        .from('accounts_memberships')
        .select('role:account_role, user_id')
        .in('user_id', data.map((member) => member.user_id ?? ''));

      if(rolesError) {
        throw new Error(`Error fetching roles: ${rolesError.message}`);
      }

      roles = rolesData.map((role) => ({
        user_id: role.user_id ?? '',
        role: role.role ?? '',
      }));

    }
    const members = data.map((member) => ({
      ...member,
      user: {
        id: member.user_id ?? '',
        email: member.user?.email ?? '',
        name: member.user?.settings?.name ?? '',
        picture_url: member.user?.settings?.picture_url ?? '',
        role: roles?.find((role) => role.user_id === member.user_id)?.role ?? undefined,
      },
    }));

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
        id: data.user_id ?? '',
        email: data.user?.email ?? '',
        name: data.user?.settings?.name ?? '',
        picture_url: data.user?.settings?.picture_url ?? '',
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
      .eq('chat_id', chat_id ?? '')
      .eq('user_id', user_id ?? '')
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
        id: data?.user_id ?? '',
        email: data?.user?.email ?? '',
        name: data?.user?.settings?.name ?? '',
        picture_url: data?.user?.settings?.picture_url ?? '',
      },

    }

    return member as ChatMembers.TypeWithRelations;
  }
}
