import { ChatRoleType } from './middleware/validate_chat_role';
import { Members } from '~/lib/members.types';
export interface ChatPayload {
  name: string;
  user_id: string;
  members?: { user_id: string; role: ChatRoleType }[];
  settings?: Record<string, unknown>;
  visibility: boolean;
  image?: string;
  role?: string[];
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
  members?: Members.Member[];
  messages?: {
    id: string;
    account_id: string;
    content: string;
    role: ChatRoleType;
    created_at: string;
  }[];
}

export interface DeleteChatResponse {
  success: boolean;
  message: string;
}

export interface UpdateChatSettingsPayload {
  chat_id: string;
  settings: Record<string, unknown>;
  role?: string[];
}

export interface UpdateChatSettingsResponse {
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

  // * DELETE INTERFACES
  /**
   * Deletes a chat by its ID.
   * @param {string} chatId - ID of the chat to delete.
   * @returns {Promise<DeleteChatResponse>} - Response indicating the result of the deletion.
   */
  deleteChat(chatId: string): Promise<DeleteChatResponse>;

  // * UPDATE INTERFACES
  /**
   * Updates the settings of a specific chat.
   * @param {UpdateChatSettingsPayload} payload - Data containing the chat ID and updated settings.
   * @returns {Promise<UpdateChatSettingsResponse>} - Response indicating the result of the update operation.
   */
  updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse>;
}
