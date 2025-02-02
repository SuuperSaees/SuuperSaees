'use server';

import { createChatAction } from './chat';
import {
  ChatPayload,
  UpdateChatSettingsPayload,
} from './chat.interface';
import {
  ChatRoleType,
  validateChatRole,
} from './middleware/validate_chat_role';
import { Chats } from '~/lib/chats.types';

function getChatAction() {
  return createChatAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createChat(payload: ChatPayload) {
  validateChatRole(
    ['owner', 'project_manager'] as ChatRoleType[],
    payload.role ?? [],
  );
  return await getChatAction().createChat(payload);
}

export async function getChats() {
  return await getChatAction().getChats();
}

export async function getChatById(chatId: string) {
  return await getChatAction().getChatById(chatId);
}

export async function deleteChat(chatId: string) {
  return await getChatAction().deleteChat(chatId);
}

export async function updateChatSettings(payload: UpdateChatSettingsPayload) {
  return await getChatAction().updateChatSettings(payload);
}

export async function updateChat(payload: Chats.Update) {
  return await getChatAction().updateChat(payload);
}

