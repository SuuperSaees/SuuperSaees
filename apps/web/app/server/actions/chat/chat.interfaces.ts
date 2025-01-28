import { ChatRoleType } from './middleware/validate_chat_role';

export interface ChatPayload {
  name: string;
  user_id: string;
  members?: { user_id: string; role: ChatRoleType }[];
  settings?: Record<string, unknown>;
  visibility: boolean;
  image?: string;
}

export interface ChatResponse {
  id: string;
  name: string;
  user_id: string;
  settings?: Record<string, unknown>;
  visibility: boolean;
  image?: string;
  created_at: string;
  deleted_on?: string;
}

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

export interface ChatMessagePayload {
  chat_id: string;
  user_id: string;
  content: string;
  role: ChatRoleType;
}

export interface ChatMessageResponse {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  role: ChatRoleType;
  created_at: string;
}

export interface GetChatsResponse {
  id: string;
  name: string;
  user_id: string;
  settings?: Record<string, unknown>;
  visibility: boolean;
  image?: string;
  created_at: string;
  isOwner?: boolean;
  members_count?: number;
}

export interface GetChatByIdResponse {
  id: string;
  name: string;
  user_id: string;
  settings?: Record<string, unknown>;
  visibility: boolean;
  image?: string;
  created_at: string;
  updated_at?: string;
  deleted_on?: string;
  members?: {
    user_id: string;
    role: ChatRoleType;
  }[];
  messages?: {
    id: string;
    user_id: string;
    content: string;
    role: ChatRoleType;
    created_at: string;
  }[];
}

export interface GetMembersResponse {
  user_id: string;
  role: ChatRoleType;
  settings?: Record<string, unknown>;
  joined_at: string;
}

export interface GetMessagesResponse {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  role: ChatRoleType;
  created_at: string;
}

export interface MemberSettingsResponse {
  user_id: string;
  chat_id: string;
  settings: Record<string, unknown>;
}

export interface DeleteChatResponse {
  success: boolean;
  message: string;
}

export interface RemoveMemberPayload {
  chat_id: string;
  user_id: string;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

export interface DeleteMessagePayload {
  chat_id: string;
  message_id: string;
}

export interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

export interface ClearChatMessagesPayload {
  chat_id: string;
}

export interface ClearChatMessagesResponse {
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

export interface UpdateChatSettingsPayload {
  chat_id: string;
  settings: Record<string, unknown>;
}

export interface UpdateChatSettingsResponse {
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

export interface UpdateMessageContentPayload {
  chat_id: string;
  message_id: string;
  new_content: string;
}

export interface UpdateMessageContentResponse {
  success: boolean;
  message: string;
}

export interface IChatAction {
  //* CREATE INTERFACES
  /**
   * Creates a new chat
   * @param {ChatPayload} payload - Data for creating the chat
   * @returns {Promise<ChatResponse>} - The created chat object with its details
   */
  createChat(payload: ChatPayload): Promise<ChatResponse>;

  /**
   * Adds members to an existing chat
   * @param {AddMembersPayload} payload - Data of the chat and members to be added
   * @returns {Promise<AddMembersResponse>} - Result of the member addition operation
   */
  addMembers(payload: AddMembersPayload): Promise<AddMembersResponse>;

  /**
   * Creates a new message in the chat
   * @param {ChatMessagePayload} payload - Data of the message to be sent
   * @returns {Promise<ChatMessageResponse>} - The created message object with its details
   */
  createMessage(payload: ChatMessagePayload): Promise<ChatMessageResponse>;

  // * GET INTERFACES
  /**
   * Retrieves all chats accessible to the user
   * @returns {Promise<GetChatsResponse[]>} - List of chats the user can access
   */
  getChats(): Promise<GetChatsResponse[]>;

  /**
   * Retrieves a specific chat by its ID, including its details, members, and messages.
   * @param {string} chatId - The ID of the chat to fetch.
   * @returns {Promise<GetChatByIdResponse>} - The details of the chat with its members and messages.
   */
  getChatById(chatId: string): Promise<GetChatByIdResponse>;

  /**
   * Retrieves all members of a specific chat
   * @param {string} chatId - The ID of the chat to fetch members for
   * @returns {Promise<GetMembersResponse[]>} - List of members with their roles and settings
   */
  getMembers(chatId: string): Promise<GetMembersResponse[]>;

  /**
   * Retrieves all messages from a specific chat
   * @param {string} chatId - The ID of the chat to fetch messages from
   * @returns {Promise<GetMessagesResponse[]>} - List of messages in the chat
   */
  getMessages(chatId: string): Promise<GetMessagesResponse[]>;

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

  // * DELETE INTERFACES
  /**
   * Deletes a chat by its ID.
   * @param {string} chatId - ID of the chat to delete.
   * @returns {Promise<DeleteChatResponse>} - Response indicating the result of the deletion.
   */
  deleteChat(chatId: string): Promise<DeleteChatResponse>;

  /**
   * Removes a member from a chat.
   * @param {RemoveMemberPayload} payload - Data containing the chat ID and user ID to remove.
   * @returns {Promise<RemoveMemberResponse>} - Response indicating the result of the removal.
   */
  removeMember(payload: RemoveMemberPayload): Promise<RemoveMemberResponse>;

  /**
   * Deletes a specific message from a chat.
   * @param {DeleteMessagePayload} payload - Data containing the chat ID and message ID to delete.
   * @returns {Promise<DeleteMessageResponse>} - Response indicating the result of the deletion.
   */
  deleteMessage(payload: DeleteMessagePayload): Promise<DeleteMessageResponse>;

  /**
   * Clears all messages in a specific chat without deleting the chat itself.
   * @param {ClearChatMessagesPayload} payload - Data containing the chat ID.
   * @returns {Promise<ClearChatMessagesResponse>} - Response indicating the result of the clearing operation.
   */
  clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse>;

  /**
   * Resets the settings of a specific member in a chat.
   * @param {ResetMemberSettingsPayload} payload - Data containing the chat ID and user ID.
   * @returns {Promise<ResetMemberSettingsResponse>} - Response indicating the result of the reset operation.
   */
  resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse>;

  // * UPDATE INTERFACES
  /**
   * Updates the settings of a specific chat.
   * @param {UpdateChatSettingsPayload} payload - Data containing the chat ID and updated settings.
   * @returns {Promise<UpdateChatSettingsResponse>} - Response indicating the result of the update operation.
   */
  updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse>;

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

  /**
   * Updates the content of a specific message in a chat.
   * @param {UpdateMessageContentPayload} payload - Data containing the chat ID, message ID, and new content.
   * @returns {Promise<UpdateMessageContentResponse>} - Response indicating the result of the update operation.
   */
  updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse>;
}
