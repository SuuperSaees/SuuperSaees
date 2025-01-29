'use server';

import {
  CustomError,
  CustomResponse,
  ErrorChatOperations,
  HttpStatus,
} from '@kit/shared/response';

import {
  ChatPayload,
  UpdateChatSettingsPayload,
} from '../../interfaces/chat.interfaces';
import {
  ChatRoleType,
  validateChatRole,
} from '../../middleware/validate_chat_role';
import { createChatAction } from '../chat';

// * CREATE ACTIONS

/**
 * @name createChat
 * @description Server action to create a new chat.
 * @param {ChatPayload & { role?: string[]; members: { user_id: string; role: ChatRoleType }[] }} payload - Chat data.
 * @returns {JSONCustomResponse} A standardized response with the created chat or an error message.
 */
export async function createChat(
  payload: ChatPayload & {
    role?: string[];
    members: { user_id: string; role: ChatRoleType }[];
  },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      payload.role ?? [],
    );

    const chatAction = createChatAction('');
    const newChat = await chatAction.createChat(payload);

    return CustomResponse.success(newChat, 'chatCreated').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while creating the chat: ${error.message}`
        : 'Unexpected error while creating the chat',
      ErrorChatOperations.FAILED_TO_CREATE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * GET ACTIONS

/**
 * @name getChats
 * @description Server action to fetch all chats accessible to the user.
 * @param {string} user_id - User ID.
 * @param {string[]} role - User roles.
 * @returns {JSONCustomResponse} A standardized response with the fetched chats or an error message.
 */
export async function getChats(user_id: string, role: string[]) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      role,
    );

    const chatAction = createChatAction('');
    const chats = await chatAction.getChats();

    return CustomResponse.success(chats, 'chatsFetched').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while fetching chats: ${error.message}`
        : 'Unexpected error while fetching chats',
      ErrorChatOperations.CHAT_NOT_FOUND,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

/**
 * @name getChatById
 * @description Server action to fetch a specific chat by ID.
 * @param {string} chatId - The chat ID.
 * @param {string[]} role - User roles.
 * @returns {JSONCustomResponse} A standardized response with the chat details or an error message.
 */
export async function getChatById(chatId: string, role: string[]) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      role,
    );

    const chatAction = createChatAction('');
    const chat = await chatAction.getChatById(chatId);

    return CustomResponse.success(chat, 'chatFetched').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while fetching chat by ID: ${error.message}`
        : 'Unexpected error while fetching chat by ID',
      ErrorChatOperations.CHAT_NOT_FOUND,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * UPDATE ACTIONS
/**
 * @name updateChatSettings
 * @description Server action to update chat settings.
 * @param {UpdateChatSettingsPayload & { role?: string[] }} payload - Chat settings update payload.
 * @returns {JSONCustomResponse} A standardized response with the updated settings or an error message.
 */
export async function updateChatSettings(
  payload: UpdateChatSettingsPayload & { role?: string[] },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      payload.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.updateChatSettings(payload);

    return CustomResponse.success(result, 'chatSettingsUpdated').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while updating chat settings: ${error.message}`
        : 'Unexpected error while updating chat settings',
      ErrorChatOperations.FAILED_TO_UPDATE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * DELETE ACTIONS
/**
 * @name deleteChat
 * @description Server action to delete a chat by its ID.
 * @param {string} chatId - The chat ID.
 * @param {string[]} role - User roles.
 * @returns {JSONCustomResponse} A standardized response with the result of the deletion or an error message.
 */
export async function deleteChat(chatId: string, role: string[]) {
  try {
    validateChatRole([ChatRoleType.Owner, ChatRoleType.ProjectManager], role);

    const chatAction = createChatAction('');
    const result = await chatAction.deleteChat(chatId);

    return CustomResponse.success(result, 'chatDeleted').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while deleting the chat: ${error.message}`
        : 'Unexpected error while deleting the chat',
      ErrorChatOperations.FAILED_TO_DELETE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}
