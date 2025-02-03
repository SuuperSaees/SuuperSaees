import { CustomError, ErrorChatOperations } from '@kit/shared/response';

import { Database } from '~/lib/database.types';

export type ChatRoleType = Database['public']['Enums']['chat_role_type'];


export const validateChatRole = (
  allowedRoles: ChatRoleType[],
  roles: string[],
) => {
  if (!roles || !Array.isArray(roles)) {
    throw new CustomError(
      400,
      'La propiedad "roles" es requerida y debe ser un array.',
      ErrorChatOperations.FAILED_TO_CREATE_CHAT,
    );
  }

  const invalidRoles = roles.filter(
    (role: string) => !allowedRoles.includes(role as ChatRoleType),
  );

  if (invalidRoles.length > 0) {
    throw new CustomError(
      400,
      `Roles inválidos: ${invalidRoles.join(', ')}`,
      ErrorChatOperations.INSUFFICIENT_PERMISSIONS,
    );
  }
};
