'use server';

import {
  CustomError,
  CustomResponse,
  ErrorChatOperations,
  HttpStatus,
} from '@kit/shared/response';

import {
  AddMembersPayload,
  RemoveMemberPayload,
  ResetMemberSettingsPayload,
  UpdateMemberSettingsPayload,
  UpdateMemberVisibilityPayload,
} from '../../interfaces/chat.interfaces';
import {
  ChatRoleType,
  validateChatRole,
} from '../../middleware/validate_chat_role';
import { createMembersAction } from '../members';

// * CREATE ACTIONS
export async function addMembers(payload: AddMembersPayload) {
  try {
    payload.members.forEach((member) => {
      validateChatRole(
        [ChatRoleType.Owner, ChatRoleType.ProjectManager],
        [member.role],
      );
    });

    const chatAction = createMembersAction('');
    const result = await chatAction.addMembers(payload);

    return CustomResponse.success(result, 'membersAdded').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while adding members: ${error.message}`
        : 'Unexpected error while adding members',
      ErrorChatOperations.FAILED_TO_ADD_MEMBERS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * GET ACTIONS
export async function getMembers(chatId: string, role?: string[]) {
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

    const chatAction = createMembersAction('');
    const members = await chatAction.getMembers(chatId);

    return CustomResponse.success(members, 'membersFetched').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while fetching members: ${error.message}`
        : 'Unexpected error while fetching members',
      ErrorChatOperations.FAILED_TO_ADD_MEMBERS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

export async function getMemberSettings(
  chatId: string,
  userId: string,
  role?: string[],
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager, ChatRoleType.Assistant],
      role ?? [],
    );

    if (!chatId || !userId) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'chatId and userId are required',
        ErrorChatOperations.CHAT_NOT_FOUND,
        'Bad Request',
      );
    }

    const chatAction = createMembersAction('');
    const memberSettings = await chatAction.getMemberSettings(chatId, userId);

    return CustomResponse.success(
      memberSettings,
      'memberSettingsFetched',
    ).toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while fetching member settings: ${error.message}`
        : 'Unexpected error while fetching member settings',
      ErrorChatOperations.FAILED_TO_GET_MEMBER_SETTINGS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * UPDATE ACTIONS
export async function updateMemberVisibility(
  payload: UpdateMemberVisibilityPayload & { role?: string[] },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      payload.role ?? [],
    );

    const chatAction = createMembersAction('');
    const result = await chatAction.updateMemberVisibility(payload);

    return CustomResponse.success(result, 'memberVisibilityUpdated').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while updating member visibility: ${error.message}`
        : 'Unexpected error while updating member visibility',
      ErrorChatOperations.FAILED_TO_UPDATE_CHAT,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

export async function updateMemberSettings(
  payload: UpdateMemberSettingsPayload,
) {
  try {
    const chatAction = createMembersAction('');
    const result = await chatAction.updateMemberSettings(payload);

    return CustomResponse.success(result, 'memberSettingsUpdated').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while updating member settings: ${error.message}`
        : 'Unexpected error while updating member settings',
      ErrorChatOperations.FAILED_TO_GET_MEMBER_SETTINGS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

// * DELETE ACTIONS
export async function removeMember(
  payload: RemoveMemberPayload & { role?: string[] },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      payload.role ?? [],
    );

    const chatAction = createMembersAction('');
    const result = await chatAction.removeMember(payload);

    return CustomResponse.success(result, 'memberRemoved').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while removing member: ${error.message}`
        : 'Unexpected error while removing member',
      ErrorChatOperations.FAILED_TO_REMOVE_MEMBERS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}

export async function resetMemberSettings(
  payload: ResetMemberSettingsPayload & { role?: string[] },
) {
  try {
    validateChatRole(
      [ChatRoleType.Owner, ChatRoleType.ProjectManager],
      payload.role ?? [],
    );

    const chatAction = createMembersAction('');
    const result = await chatAction.resetMemberSettings(payload);

    return CustomResponse.success(result, 'memberSettingsReset').toJSON();
  } catch (error: unknown) {
    const customError = new CustomError(
      HttpStatus.Error.InternalServerError,
      error instanceof Error
        ? `Unexpected error while resetting member settings: ${error.message}`
        : 'Unexpected error while resetting member settings',
      ErrorChatOperations.FAILED_TO_GET_MEMBER_SETTINGS,
      'Internal Server Error',
      { error },
    );
    return CustomResponse.error(customError).toJSON();
  }
}
