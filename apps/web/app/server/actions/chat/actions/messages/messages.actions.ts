'use server';

import {
  CustomError,
  CustomResponse,
  ErrorChatOperations,
  HttpStatus,
} from '@kit/shared/response';

import {
  ChatMessagePayload,
  ClearChatMessagesPayload,
  DeleteMessagePayload,
  UpdateMessageContentPayload,
} from '../../interfaces/chat.interfaces';
import {
  ChatRoleType,
  validateChatRole,
} from '../../middleware/validate_chat_role';
import { createMessagesAction } from '../messages';

// * CREATE ACTIONS
export async function createMessage(payload: ChatMessagePayload) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      [payload.role],
    );

    const chatAction = createMessagesAction('');
    const newMessage = await chatAction.createMessage(payload);

    return CustomResponse.success(newMessage, 'messageCreated').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while creating the message: ${error.message}`
        : 'Unexpected error while creating the message',
      ErrorChatOperations.FAILED_TO_CREATE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * GET ACTIONS
export async function getMessages(chatId: string, role?: string[]) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      role ?? [],
    );

    if (!chatId) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'chatId is required',
        ErrorChatOperations.CHAT_NOT_FOUND,
        'Bad Request',
      );
    }

    const chatAction = createMessagesAction('');
    const messages = await chatAction.getMessages(chatId);

    return CustomResponse.success(messages, 'messagesFetched').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while fetching messages: ${error.message}`
        : 'Unexpected error while fetching messages',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * UPDATE ACTIONS
export async function updateMessageContent(
  payload: UpdateMessageContentPayload,
) {
  try {
    const chatAction = createMessagesAction('');
    const result = await chatAction.updateMessageContent(payload);

    return CustomResponse.success(result, 'messageContentUpdated').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while updating message content: ${error.message}`
        : 'Unexpected error while updating message content',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * DELETE ACTIONS
export async function deleteMessage(
  payload: DeleteMessagePayload & { role?: string[] },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      payload.role ?? [],
    );

    const chatAction = createMessagesAction('');
    const result = await chatAction.deleteMessage(payload);

    return CustomResponse.success(result, 'messageDeleted').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while deleting message: ${error.message}`
        : 'Unexpected error while deleting message',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

export async function clearChatMessages(
  payload: ClearChatMessagesPayload & { role?: string[] },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      payload.role ?? [],
    );

    const chatAction = createMessagesAction('');
    const result = await chatAction.clearChatMessages(payload);

    return CustomResponse.success(result, 'chatMessagesCleared').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while clearing chat messages: ${error.message}`
        : 'Unexpected error while clearing chat messages',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}
