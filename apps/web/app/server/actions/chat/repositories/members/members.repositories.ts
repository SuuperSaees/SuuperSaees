import { SupabaseClient } from '@supabase/supabase-js';

import {
  GetMembersResponse,
  MemberSettingsResponse,
  UpdateMemberSettingsPayload,
  UpdateMemberSettingsResponse,
  UpdateMemberVisibilityPayload,
} from '../../interfaces/chat.interfaces';
import { ChatRoleType } from '../../middleware/validate_chat_role';

export class MembersRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // * CREATE REPOSITORIES
  /**
   * @name addMembers
   * @description Adds members to an existing chat. Updates them if they already exist.
   * @param {string} chat_id - Chat ID to add members to.
   * @param {Array<{ user_id: string, role: string }>} members - List of members with their roles to add to the chat.
   * @returns {Promise<{ success: boolean; message: string }>} Success response.
   * @throws {Error} If an error occurs while adding members.
   */
  async addMembers(
    chat_id: string,
    members: { user_id: string; role: string }[],
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await this.client.from('chat_members').upsert(
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
  /**
   * @name getMembers
   * @description Fetches all members of a specific chat from the database.
   * @param {string} chatId - The ID of the chat to fetch members for.
   * @returns {Promise<{ success: boolean; message: string; data: GetMembersResponse[] }>} List of members with their roles and settings.
   * @throws {Error} If an error occurs while fetching the members.
   */
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    const { data, error } = await this.client
      .from('chat_members')
      .select(`
        user_id,
        role,
        settings,
        created_at
      `)
      .eq('chat_id', chatId);
  
    if (error) {
      throw new Error(`Error fetching members for chat ${chatId}: ${error.message}`);
    }
  
    return (data || []).map((member) => ({
      user_id: member.user_id,
      role: member.role as ChatRoleType,
      settings: member.settings || {},
      joined_at: member.created_at,
    })) as GetMembersResponse[];
  }
  

  /**
   * @name getMemberSettings
   * @description Fetches the settings of a specific member in a chat from the database.
   * @param {string} chatId - The ID of the chat.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<{ success: boolean; message: string; data: MemberSettingsResponse }>} The member's settings in the chat.
   * @throws {Error} If an error occurs while fetching the settings.
   */
  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    const { data, error } = await this.client
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
  /**
   * @name removeMember
   * @description Removes a member from a chat in the database.
   * @param {string} chat_id - ID of the chat.
   * @param {string} user_id - ID of the user to remove.
   * @returns {Promise<{ success: boolean; message: string }>} Success response.
   * @throws {Error} If an error occurs while removing the member.
   */
  async removeMember(
    chat_id: string,
    user_id: string,
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await this.client
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

  /**
   * @name resetMemberSettings
   * @description Resets the settings of a specific member in a chat in the database.
   * @param {string} chat_id - ID of the chat.
   * @param {string} user_id - ID of the member whose settings should be reset.
   * @returns {Promise<{ success: boolean; message: string }>} Success response.
   * @throws {Error} If an error occurs while resetting the settings.
   */
  async resetMemberSettings(
    chat_id: string,
    user_id: string,
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await this.client
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

  // * UPDATE REPOSITORIES
  /**
   * @name updateMemberSettings
   * @description Updates the settings of a specific member in a chat in the database.
   * @param {UpdateMemberSettingsPayload} payload - Data required to perform the update.
   * @returns {Promise<{ success: boolean; message: string }>} Success response.
   * @throws {Error} If an error occurs while updating the settings.
   */
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    const { chat_id, user_id, settings } = payload;

    const { error } = await this.client
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

  /**
   * @name updateMemberVisibility
   * @description Updates the visibility of a member in a chat in the database.
   * @param {UpdateMemberVisibilityPayload} payload - Data required for the operation.
   * @returns {Promise<{ success: boolean; message: string }>} Success response.
   * @throws {Error} If an error occurs while updating the visibility.
   */
  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<{ success: boolean; message: string }> {
    const { error } = await this.client
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
