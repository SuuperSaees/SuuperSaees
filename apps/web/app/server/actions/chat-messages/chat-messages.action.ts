'use server';
import { ChatMessages } from '~/lib/chat-messages.types';
import { createChatMessagesAction } from './chat-messages';

function getMessagesAction() {
  return createChatMessagesAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createMessage(payload: ChatMessages.InsertWithRelations) {
  return await getMessagesAction().create(payload);
}


export async function getMessages(chatId: string) {
  return await getMessagesAction().list(chatId);
}

export async function deleteMessage(chatId?: string, messageId?: string) {
  return await getMessagesAction().delete(chatId, messageId);
}

export async function updateMessage(
  payload: ChatMessages.Update,
) {
  return await getMessagesAction().update(payload);
}
