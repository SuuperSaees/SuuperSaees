import { Chats } from "~/lib/chats.types";

export interface IChatAction {
  //* CREATE INTERFACES
  /**
   * Creates a new chat
   * @param {ChatPayload} payload - Data for creating the chat
   * @returns {Promise<ChatResponse>} - The created chat object with its details
   */
  create(payload: Chats.InsertWithRelations): Promise<Chats.Type>;


  // * GET INTERFACES
  /**
   * Retrieves all chats accessible to the user
   * @returns {Promise<GetChatsResponse[]>} - List of chats the user can access
   */
  list(userId: string): Promise<Chats.TypeWithRelations[]>;


  /**
   * Retrieves a specific chat by its ID, including its details, members, and messages.
   * @param {string} chatId - The ID of the chat to fetch.
   * @returns {Promise<GetChatByIdResponse>} - The details of the chat with its members and messages.
   */
  get(chatId: string): Promise<Chats.TypeWithRelations>;


  // * DELETE INTERFACES
  /**
   * Deletes a chat by its ID.
   * @param {string} chatId - ID of the chat to delete.
   * @returns {Promise<DeleteChatResponse>} - Response indicating the result of the deletion.
   */
  delete(chatId: string): Promise<void>;


  // * UPDATE INTERFACES
  /**
   * Updates the settings of a specific chat.
   * @param {UpdateChatSettingsPayload} payload - Data containing the chat ID and updated settings.
   * @returns {Promise<UpdateChatSettingsResponse>} - Response indicating the result of the update operation.
   */
  update(payload: Chats.Update): Promise<Chats.Type>;

}
