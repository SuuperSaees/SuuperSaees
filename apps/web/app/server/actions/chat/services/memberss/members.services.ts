import { SupabaseClient } from '@supabase/supabase-js';

import {
  AddMembersPayload,
  AddMembersResponse,
  GetMembersResponse,
  MemberSettingsResponse,
  RemoveMemberPayload,
  RemoveMemberResponse,
  ResetMemberSettingsPayload,
  ResetMemberSettingsResponse,
  UpdateMemberSettingsPayload,
  UpdateMemberSettingsResponse,
  UpdateMemberVisibilityPayload,
  UpdateMemberVisibilityResponse,
} from '../../interfaces/chat.interfaces';
import { MembersRepository } from '../../repositories/members/members.repositories';

export class MembersService {
  private membersRepository: MembersRepository;

  constructor(
    _baseUrl: string,
    client: SupabaseClient,
    _adminClient: SupabaseClient,
  ) {
    this.membersRepository = new MembersRepository(client);
  }

  // * CREATE SERVICES
  /**
   * @name addMembers
   * @description Adds members to an existing chat.
   * @param {AddMembersPayload} payload - Data containing the chat ID and the members to add.
   * @returns {Promise<AddMembersResponse>} Response indicating whether the members were successfully added.
   */
  async addMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    const { chat_id, members } = payload;
    return await this.membersRepository.addMembers(chat_id, members);
  }

  // * GET SERVICES
  /**
   * @name getMembers
   * @description Fetches all members of a specific chat using the repository.
   * @param {string} chatId - The ID of the chat to fetch members for.
   * @returns {Promise<GetMembersResponse[]>} List of members with their roles and settings.
   * @throws {Error} If an error occurs while fetching the members.
   */
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    return await this.membersRepository.getMembers(chatId);
  }

  /**
   * @name getMemberSettings
   * @description Fetches the settings of a specific member in a chat via the repository.
   * @param {string} chatId - The ID of the chat
   * @param {string} userId - The ID of the user
   * @returns {Promise<MemberSettingsResponse>} The member's settings in the chat.
   */
  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.membersRepository.getMemberSettings(chatId, userId);
  }

  // * DELETE SERVICES
  /**
   * @name removeMember
   * @description Removes a member from a chat by calling the repository.
   * @param {RemoveMemberPayload} payload - Data containing the chat ID and user ID to remove.
   * @returns {Promise<RemoveMemberResponse>} Response indicating the result of the removal.
   */
  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    const { chat_id, user_id } = payload;
    return await this.membersRepository.removeMember(chat_id, user_id);
  }

  /**
   * @name resetMemberSettings
   * @description Resets the settings of a specific member in a chat by calling the repository.
   * @param {ResetMemberSettingsPayload} payload - Data containing the chat ID and user ID.
   * @returns {Promise<ResetMemberSettingsResponse>} Response indicating the result of the reset operation.
   */
  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    const { chat_id, user_id } = payload;
    return await this.membersRepository.resetMemberSettings(chat_id, user_id);
  }

  // * UPDATE SERVICES
  /**
   * @name updateMemberSettings
   * @description Updates the settings of a specific member in a chat.
   * @param {UpdateMemberSettingsPayload} payload - Data required to perform the update.
   * @returns {Promise<UpdateMemberSettingsResponse>} Response indicating the success or failure of the operation.
   */
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    return await this.membersRepository.updateMemberSettings(payload);
  }

  /**
   * @name updateMemberVisibility
   * @description Calls the repository to update the visibility of a member in a chat.
   * @param {UpdateMemberVisibilityPayload} payload - Data required for the operation.
   * @returns {Promise<UpdateMemberVisibilityResponse>} Response indicating whether the operation was successful.
   */
  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    return await this.membersRepository.updateMemberVisibility(payload);
  }
}
