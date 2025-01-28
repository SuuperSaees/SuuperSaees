'use server';

import { NextRequest } from 'next/server';

import {
  CustomError,
  CustomResponse,
  ErrorChatOperations,
  HttpStatus,
} from '@kit/shared/response';

import { createChatAction } from './chat';
import {
  AddMembersPayload,
  ChatMessagePayload,
  ChatPayload,
  ClearChatMessagesPayload,
  DeleteMessagePayload,
  RemoveMemberPayload,
  ResetMemberSettingsPayload,
  UpdateChatSettingsPayload,
  UpdateMemberSettingsPayload,
  UpdateMemberVisibilityPayload,
  UpdateMessageContentPayload,
} from './chat.interfaces';
import {
  ChatRoleType,
  validateChatRole,
} from './middleware/validate_chat_role';

// * CREATE ACTIONS
/**
 * @name createChat
 * @description Server action to create a new chat.
 * Validates user roles and creates the chat by delegating to the appropriate action.
 * @param {NextRequest} req - The incoming HTTP request containing the chat data.
 * @returns {JSONCustomResponse} A standardized response with the created chat or an error message.
 */
export async function createChat(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatPayload & {
      role?: string[];
      members: { user_id: string; role: ChatRoleType }[];
    };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      body.role ?? [],
    );

    const chatAction = createChatAction('');

    const newChat = await chatAction.createChat(body);

    const addMembersAction = createChatAction('');
    await addMembersAction.addMembers({
      chat_id: newChat.id,
      members: body.members,
    });

    return CustomResponse.success(newChat, 'chatCreated').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    return CustomResponse.error(
      new CustomError(
        HttpStatus.Error.InternalServerError,
        'Error inesperado al crear el chat',
        ErrorChatOperations.FAILED_TO_CREATE_CHAT,
        'Internal Server Error',
        { error },
      ),
    ).toJSON();
  }
}

/**
 * @name addMembers
 * @description Server action to add members to an existing chat.
 * Validates user roles before adding members to the chat.
 * @param {NextRequest} req - The incoming HTTP request containing the members to add to the chat.
 * @returns {JSONCustomResponse} A standardized response with the result of adding members or an error message.
 */
export async function addMembers(req: NextRequest) {
  try {
    const body = (await req.json()) as AddMembersPayload;

    body.members.forEach((member) => {
      validateChatRole(
        [ChatRoleType.Owner, ChatRoleType.ProjectManager],
        [member.role],
      );
    });

    const chatAction = createChatAction('');
    const result = await chatAction.addMembers(body);

    return CustomResponse.success(result, 'membersAdded').toJSON();
  } catch (error: unknown) {
    if (error instanceof Error) {
      const customError = new CustomError(
        HttpStatus.Error.InternalServerError,
        error.message,
        ErrorChatOperations.FAILED_TO_ADD_MEMBERS,
        'Internal Server Error',
        { error },
      );
      return CustomResponse.error(customError).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al agregar miembros',
      ErrorChatOperations.FAILED_TO_ADD_MEMBERS,
      'Internal Server Error',
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name createMessage
 * @description Server action to create a new message within a chat.
 * Validates user roles before creating a new message.
 * @param {NextRequest} req - The incoming HTTP request containing the message data.
 * @returns {JSONCustomResponse} A standardized response with the created message or an error message.
 */
export async function createMessage(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatMessagePayload;

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      [body.role],
    );

    const chatAction = createChatAction('');
    const newMessage = await chatAction.createMessage(body);

    return CustomResponse.success(newMessage, 'messageCreated').toJSON();
  } catch (error: unknown) {
    if (error instanceof Error) {
      const customError = new CustomError(
        HttpStatus.Error.InternalServerError,
        error.message,
        ErrorChatOperations.FAILED_TO_CREATE_CHAT,
        'Internal Server Error',
        { error },
      );
      return CustomResponse.error(customError).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al crear el mensaje',
      ErrorChatOperations.FAILED_TO_CREATE_CHAT,
      'Internal Server Error',
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

// * GET ACTIONS
/**
 * @name getChats
 * @description Server action to fetch all chats accessible to the requesting user.
 * Validates user roles to ensure access control and retrieves chats by delegating to the appropriate action.
 * @param {NextRequest} req - The incoming HTTP request.
 * @returns {JSONCustomResponse} A standardized response with the fetched chats or an error message.
 */
export async function getChats(req: NextRequest) {
  try {
    const body = (await req.json()) as { user_id: string; role?: string[] };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const chats = await chatAction.getChats();

    return CustomResponse.success(chats, 'chatsFetched').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al obtener los chats',
      ErrorChatOperations.CHAT_NOT_FOUND,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name getChatById
 * @description Server action para obtener un chat específico por ID.
 * Valida roles y delega la lógica al controlador correspondiente.
 * @param {NextRequest} req - La solicitud entrante que contiene el chatId.
 * @returns {JSONCustomResponse} Respuesta con los detalles del chat o un error.
 */
export async function getChatById(req: NextRequest) {
  try {
    const { chatId, role } = (await req.json()) as {
      chatId: string;
      role?: string[];
    };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      role ?? [],
    );

    const chatAction = createChatAction('');
    const chat = await chatAction.getChatById(chatId);

    return CustomResponse.success(chat, 'chatFetched').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al obtener el chat',
      ErrorChatOperations.CHAT_NOT_FOUND,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name getMembers
 * @description Server action to fetch all members of a specific chat.
 * Validates user roles and retrieves the members by delegating to the appropriate action.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID.
 * @returns {JSONCustomResponse} A standardized response with the list of members or an error message.
 */
export async function getMembers(req: NextRequest) {
  try {
    const body = (await req.json()) as { chatId: string; role?: string[] };
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      body.role ?? [],
    );

    if (!body.chatId) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'chatId is required',
        ErrorChatOperations.CHAT_NOT_FOUND,
        'Bad Request',
      );
    }

    const chatAction = createChatAction('');
    const members = await chatAction.getMembers(body.chatId);

    return CustomResponse.success(members, 'membersFetched').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al obtener los miembros',
      ErrorChatOperations.FAILED_TO_ADD_MEMBERS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name getMessages
 * @description Server action to fetch all messages from a specific chat.
 * Validates user roles and retrieves messages by delegating to the appropriate action.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID.
 * @returns {JSONCustomResponse} A standardized response with the list of messages or an error message.
 */
export async function getMessages(req: NextRequest) {
  try {
    const body = (await req.json()) as { chatId: string; role?: string[] };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      body.role ?? [],
    );

    if (!body.chatId) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'chatId is required',
        ErrorChatOperations.CHAT_NOT_FOUND,
        'Bad Request',
      );
    }

    const chatAction = createChatAction('');
    const messages = await chatAction.getMessages(body.chatId);

    return CustomResponse.success(messages, 'messagesFetched').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al obtener los mensajes',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name getMemberSettings
 * @description Server action to fetch the settings of a specific member in a chat.
 * Validates user roles and retrieves settings by delegating to the appropriate action.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID and user ID.
 * @returns {JSONCustomResponse} A standardized response with the member's settings or an error message.
 */
export async function getMemberSettings(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      chatId: string;
      userId: string;
      role?: string[];
    };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      body.role ?? [],
    );

    if (!body.chatId || !body.userId) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'chatId and userId are required',
        ErrorChatOperations.CHAT_NOT_FOUND,
        'Bad Request',
      );
    }

    const chatAction = createChatAction('');
    const memberSettings = await chatAction.getMemberSettings(
      body.chatId,
      body.userId,
    );

    return CustomResponse.success(
      memberSettings,
      'memberSettingsFetched',
    ).toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al obtener la configuración del miembro',
      ErrorChatOperations.FAILED_TO_GET_MEMBER_SETTINGS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

// * DELETE ACTIONS
/**
 * @name deleteChat
 * @description Server action to delete a chat by its ID.
 * Only allowed for Owners or Project Managers (PMs). PMs can delete only the chats they created.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID.
 * @returns {JSONCustomResponse} A standardized response with the result of the deletion or an error message.
 */
export async function deleteChat(req: NextRequest) {
  try {
    const { chatId, role } = (await req.json()) as {
      chatId: string;
      role: string[];
    };
    validateChatRole([ChatRoleType.Owner, ChatRoleType.ProjectManager], role);

    const chatAction = createChatAction('');
    const result = await chatAction.deleteChat(chatId);

    return CustomResponse.success(result, 'chatDeleted').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al eliminar el chat',
      ErrorChatOperations.FAILED_TO_DELETE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name removeMember
 * @description Server action to remove a member from a chat.
 * Only allowed for Owners or Project Managers (PMs).
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID and user ID to remove.
 * @returns {JSONCustomResponse} A standardized response with the result of the removal or an error message.
 */
export async function removeMember(req: NextRequest) {
  try {
    const body = (await req.json()) as RemoveMemberPayload & {
      role?: string[];
    };
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.removeMember(body);

    return CustomResponse.success(result, 'memberRemoved').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al eliminar al miembro del chat',
      ErrorChatOperations.FAILED_TO_REMOVE_MEMBERS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name deleteMessage
 * @description Server action to delete a specific message from a chat.
 * Only Owners or the user who created the message can delete it.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID and message ID to delete.
 * @returns {JSONCustomResponse} A standardized response with the result of the deletion or an error message.
 */
export async function deleteMessage(req: NextRequest) {
  try {
    const body = (await req.json()) as DeleteMessagePayload & {
      role?: string[];
    };
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.deleteMessage(body);

    return CustomResponse.success(result, 'messageDeleted').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al eliminar el mensaje',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name clearChatMessages
 * @description Server action to clear all messages in a specific chat.
 * Only Owners or Project Managers can perform this operation.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID.
 * @returns {JSONCustomResponse} A standardized response with the result of the clearing or an error message.
 */
export async function clearChatMessages(req: NextRequest) {
  try {
    const body = (await req.json()) as ClearChatMessagesPayload & {
      role?: string[];
    };
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.clearChatMessages(body);

    return CustomResponse.success(result, 'chatMessagesCleared').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al borrar los mensajes del chat',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name resetMemberSettings
 * @description Server action to reset the settings of a specific member in a chat.
 * Only Owners or Project Managers can perform this operation.
 * @param {NextRequest} req - The incoming HTTP request containing the chat ID and user ID.
 * @returns {JSONCustomResponse} A standardized response with the result of the reset or an error message.
 */
export async function resetMemberSettings(req: NextRequest) {
  try {
    const body = (await req.json()) as ResetMemberSettingsPayload & {
      role?: string[];
    };
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.resetMemberSettings(body);

    return CustomResponse.success(result, 'memberSettingsReset').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al resetear las configuraciones del miembro',
      ErrorChatOperations.FAILED_TO_GET_MEMBER_SETTINGS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

// * UPDATE ACTIONS
/**
 * @name updateChatSettings
 * @description Server action para actualizar configuraciones de un chat.
 * Valida que el usuario tenga permisos y actualiza las configuraciones del chat.
 * @param {NextRequest} req - HTTP request con los datos necesarios para actualizar las configuraciones.
 * @returns {JSONCustomResponse} Respuesta estandarizada con el resultado de la operación.
 */
export async function updateChatSettings(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateChatSettingsPayload & {
      role?: string[];
    };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.updateChatSettings(body);

    return CustomResponse.success(result, 'chatSettingsUpdated').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al actualizar las configuraciones del chat',
      ErrorChatOperations.FAILED_TO_UPDATE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name updateMemberVisibility
 * @description Server action para actualizar la visibilidad de un miembro en un chat.
 * Valida que el usuario tenga permisos y actualiza la visibilidad del miembro.
 * @param {NextRequest} req - HTTP request con los datos necesarios para la operación.
 * @returns {JSONCustomResponse} Respuesta estandarizada con el resultado de la operación.
 */
export async function updateMemberVisibility(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateMemberVisibilityPayload & {
      role?: string[];
    };

    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      body.role ?? [],
    );

    const chatAction = createChatAction('');
    const result = await chatAction.updateMemberVisibility(body);

    return CustomResponse.success(result, 'memberVisibilityUpdated').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al actualizar la visibilidad del miembro',
      ErrorChatOperations.FAILED_TO_UPDATE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name updateMemberSettings
 * @description Server action to update a specific member's settings in a chat.
 * @param {NextRequest} req - The incoming HTTP request containing the update data.
 * @returns {JSONCustomResponse} A standardized response with the update result or an error message.
 */
export async function updateMemberSettings(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateMemberSettingsPayload;

    const chatAction = createChatAction('');
    const result = await chatAction.updateMemberSettings(body);

    return CustomResponse.success(result, 'memberSettingsUpdated').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al actualizar las configuraciones del miembro',
      ErrorChatOperations.FAILED_TO_GET_MEMBER_SETTINGS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}

/**
 * @name updateMessageContent
 * @description Server action to update the content of a specific message in a chat.
 * @param {NextRequest} req - The incoming HTTP request containing the update data.
 * @returns {JSONCustomResponse} A standardized response with the update result or an error message.
 */
export async function updateMessageContent(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateMessageContentPayload;

    const chatAction = createChatAction('');
    const result = await chatAction.updateMessageContent(body);

    return CustomResponse.success(result, 'messageContentUpdated').toJSON();
  } catch (error: unknown) {
    if (error instanceof CustomError) {
      return CustomResponse.error(error).toJSON();
    }
    const unknownError = new CustomError(
      HttpStatus.Error.InternalServerError,
      'Error inesperado al actualizar el contenido del mensaje',
      ErrorChatOperations.FAILED_TO_GET_MESSAGES,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(unknownError).toJSON();
  }
}
