'use server';
import {
  AddMembersPayload,
} from './chat-members.interface';
import { createChatMembersAction } from './chat-members';
import { ChatMembers } from '~/lib/chat-members.types';

function getMembersAction() {
  return createChatMembersAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function upsertMembers(payload: AddMembersPayload) {
  return await getMembersAction().upsert(payload);
}

export async function getMembers(chatId: string) {
  return await getMembersAction().list(chatId);
}

export async function getMember(chatId: string, userId: string) {
  return await getMembersAction().get(chatId, userId);
}

export async function deleteMember(chatId?: string, userId?: string) {
  return await getMembersAction().delete(chatId, userId);
}

export async function updateMember(
  payload: ChatMembers.Update,
) {
  return await getMembersAction().update(payload);
}