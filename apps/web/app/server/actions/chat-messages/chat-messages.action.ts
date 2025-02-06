'use server';
import { ChatMessages } from '~/lib/chat-messages.types';
import {
  DeleteMessagePayload,
  UpdateMessageContentPayload,
} from './chat-messages.interface';
import { createMessagesAction } from './chat-messages';

function getMessagesAction() {
  return createMessagesAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createMessage(payload: ChatMessages.InsertWithRelations) {
  return await getMessagesAction().create(payload);
}


export async function getMessages(chatId: string) {
  return await getMessagesAction().list(chatId);
}

export async function deleteMessage(payload: DeleteMessagePayload) {
  return await getMessagesAction().delete(payload);
}

export async function updateMessageContent(
  payload: UpdateMessageContentPayload,
) {
  return await getMessagesAction().update(payload);
}
