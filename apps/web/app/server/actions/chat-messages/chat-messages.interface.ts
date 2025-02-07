import { ChatMessages } from '~/lib/chat-messages.types';

export interface IChatMessagesActions {
  /**
   * Creates a new message in the chat
   * @param {ChatMessages.InsertWithRelations} payload - Data of the message to be sent
   * @returns {Promise<ChatMessages.TypeWithRelations>} - The created message object with its details
   */
  create(payload: ChatMessages.InsertWithRelations): Promise<ChatMessages.TypeWithRelations>;

  /**
   * Retrieves all messages from a specific chat
   * @param {string} chatId - The ID of the chat to fetch messages from
   * @returns {Promise<ChatMessages.TypeWithRelations[]>} - List of messages in the chat
   */
  list(chatId: string): Promise<ChatMessages.TypeWithRelations[]>;

  /**
   * Deletes a specific message from a chat.
   * @param {string} chatId - The chat ID to delete from
   * @param {string} messageId - The message ID to delete
   * @returns {Promise<void>} - No return value
   */
  delete(chatId: string, messageId: string): Promise<void>;

  /**
   * Updates a message
   * @param {ChatMessages.Update} payload - Data containing the update information
   * @returns {Promise<ChatMessages.Type>} - The updated message
   */
  update(payload: ChatMessages.Update): Promise<ChatMessages.Type>;
}