'use server';

import {
  ChatRoleType,
  validateChatRole,
} from '../chats/middleware/validate_chat_role';
import {
  ChatMessagePayload,
  ClearChatMessagesPayload,
  DeleteMessagePayload,
  UpdateMessageContentPayload,
} from './interfaces/message-interfaces';
import { createMessagesAction } from './messages';

function getMessagesAction() {
  return createMessagesAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createMessage(payload: ChatMessagePayload) {
  validateChatRole(['owner', 'project_manager'] as ChatRoleType[], [
    payload.role,
  ]);
  return await getMessagesAction().createMessage(payload);
}

export async function getMessages(chatId: string) {
  return await getMessagesAction().getMessages(chatId);
}

export async function deleteMessage(payload: DeleteMessagePayload) {
  return await getMessagesAction().deleteMessage(payload);
}

export async function clearChatMessages(payload: ClearChatMessagesPayload) {
  return await getMessagesAction().clearChatMessages(payload);
}

export async function updateMessageContent(
  payload: UpdateMessageContentPayload,
) {
  return await getMessagesAction().updateMessageContent(payload);
}
