import { ChatRoleType } from '../../chats/middleware/validate_chat_role';

export interface AddMembersPayload {
  chat_id: string;
  members: {
    user_id: string;
    role: ChatRoleType;
  }[];
}

export interface AddMembersResponse {
  success: boolean;
  message: string;
}

export interface GetMembersResponse {
  user_id: string;
  role: ChatRoleType;
  settings?: Record<string, unknown>;
  joined_at: string;
}

export interface MemberSettingsResponse {
  user_id: string;
  chat_id: string;
  settings: Record<string, unknown>;
}

export interface RemoveMemberPayload {
  chat_id: string;
  user_id: string;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

export interface ResetMemberSettingsPayload {
  chat_id: string;
  user_id: string;
}

export interface ResetMemberSettingsResponse {
  success: boolean;
  message: string;
}

export interface UpdateMemberVisibilityPayload {
  chat_id: string;
  user_id: string;
  visibility: boolean;
}

export interface UpdateMemberVisibilityResponse {
  success: boolean;
  message: string;
}

export interface UpdateMemberSettingsPayload {
  chat_id: string;
  user_id: string;
  settings: Record<string, unknown>;
}

export interface UpdateMemberSettingsResponse {
  success: boolean;
  message: string;
}

export interface IMembersActions {
  /**
   * Adds members to an existing chat
   * @param {AddMembersPayload} payload - Data of the chat and members to be added
   * @returns {Promise<AddMembersResponse>} - Result of the member addition operation
   */
  addMembers(payload: AddMembersPayload): Promise<AddMembersResponse>;

  /**
   * Retrieves all members of a specific chat
   * @param {string} chatId - The ID of the chat to fetch members for
   * @returns {Promise<GetMembersResponse[]>} - List of members with their roles and settings
   */
  getMembers(chatId: string): Promise<GetMembersResponse[]>;

  /**
   * Retrieves the settings of a specific member in a chat
   * @param {string} chatId - The ID of the chat
   * @param {string} userId - The ID of the user
   * @returns {Promise<MemberSettingsResponse>} The member's settings in the chat
   */
  getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse>;

  /**
   * Removes a member from a chat.
   * @param {RemoveMemberPayload} payload - Data containing the chat ID and user ID to remove.
   * @returns {Promise<RemoveMemberResponse>} - Response indicating the result of the removal.
   */
  removeMember(payload: RemoveMemberPayload): Promise<RemoveMemberResponse>;

  /**
   * Resets the settings of a specific member in a chat.
   * @param {ResetMemberSettingsPayload} payload - Data containing the chat ID and user ID.
   * @returns {Promise<ResetMemberSettingsResponse>} - Response indicating the result of the reset operation.
   */
  resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse>;

  /**
   * Updates the visibility of a specific member in a chat.
   * @param {UpdateMemberVisibilityPayload} payload - Data containing the chat ID, user ID, and new visibility status.
   * @returns {Promise<UpdateMemberVisibilityResponse>} - Response indicating the result of the update operation.
   */
  updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse>;

  /**
   * Updates the settings of a specific member in a chat.
   * @param {UpdateMemberSettingsPayload} payload - Data containing the chat ID, user ID, and new settings.
   * @returns {Promise<UpdateMemberSettingsResponse>} - Response indicating the result of the update operation.
   */
  updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse>;
}
