'use server';

import { createChatAction } from './chats';
import { Chats } from '~/lib/chats.types';

function getChatAction() {
  return createChatAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createChat(payload: Chats.InsertWithRelations) {
  return await getChatAction().create(payload);
}

export async function getChats(userId: string) {
  return await getChatAction().list(userId);
}

export async function getChat(chatId: string, fetchLatest?: Chats.FetchLatest) {
  return await getChatAction().get(chatId, fetchLatest);
}

export async function deleteChat(chatId: string) {
  return await getChatAction().delete(chatId);
}

export async function updateChat(payload: Chats.Update) {
  return await getChatAction().update(payload);
}

