import { ChatRoleType } from '../../chats/middleware/validate_chat_role';

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

export interface GetMessagesResponse {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  role: ChatRoleType;
  created_at: string;
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

export interface UpdateMessageContentPayload {
  chat_id: string;
  message_id: string;
  new_content: string;
}

export interface UpdateMessageContentResponse {
  success: boolean;
  message: string;
}

export interface IMessageActinos {
  /**
   * Creates a new message in the chat
   * @param {ChatMessagePayload} payload - Data of the message to be sent
   * @returns {Promise<ChatMessageResponse>} - The created message object with its details
   */
  createMessage(payload: ChatMessagePayload): Promise<ChatMessageResponse>;

  /**
   * Retrieves all messages from a specific chat
   * @param {string} chatId - The ID of the chat to fetch messages from
   * @returns {Promise<GetMessagesResponse[]>} - List of messages in the chat
   */
  getMessages(chatId: string): Promise<GetMessagesResponse[]>;

  /**
   * Deletes a specific message from a chat.
   * @param {DeleteMessagePayload} payload - Data containing the chat ID and message ID to delete.
   * @returns {Promise<DeleteMessageResponse>} - Response indicating the result of the deletion.
   */
  deleteMessage(payload: DeleteMessagePayload): Promise<DeleteMessageResponse>;

  /**
   * Updates the content of a specific message in a chat.
   * @param {UpdateMessageContentPayload} payload - Data containing the chat ID, message ID, and new content.
   * @returns {Promise<UpdateMessageContentResponse>} - Response indicating the result of the update operation.
   */
  updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse>;
}
