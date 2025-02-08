import { ChatMembers } from "~/lib/chat-members.types";
export interface AddMembersPayload {
  chat_id: string;
  members: {
    user_id: string;
    type: ChatMembers.ChatRoleType;
  }[];
}
export interface IChatMembersActions {
  /**
   * Adds or updates members in a chat
   * @param {AddMembersPayload} payload - Data of the chat and members to be added
   * @returns {Promise<ChatMembers.TypeWithRelations[]>} - Result of the member addition operation
   */
  upsert(payload: AddMembersPayload): Promise<ChatMembers.TypeWithRelations[]>;
  /**
   * Retrieves all members of a specific chat

   * @param {string} chatId - The ID of the chat to fetch members for
   * @returns {Promise<ChatMembers.TypeWithRelations[]>} - List of members with their relations
   */
  list(chatId: string): Promise<ChatMembers.TypeWithRelations[]>;

  /**
   * Retrieves a specific member in a chat
   * @param {string} chatId - The ID of the chat
   * @param {string} userId - The ID of the user
   * @returns {Promise<ChatMembers.TypeWithRelations>} The member with their relations
   */
  get(chatId: string, userId: string): Promise<ChatMembers.TypeWithRelations>;

  /**
   * Removes a member from a chat
   * @param {string} [chatId] - The ID of the chat
   * @param {string} [userId] - The ID of the user
   * @returns {Promise<void>}
   */
  delete(chatId?: string, userId?: string): Promise<void>;

  /**
   * Updates a member's information in a chat
   * @param {ChatMembers.Update} payload - The update payload
   * @returns {Promise<ChatMembers.TypeWithRelations>} - Updated member with relations
   */
  update(payload: ChatMembers.Update): Promise<ChatMembers.TypeWithRelations>;
}
