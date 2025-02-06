'use server';
import {
  AddMembersPayload,
  RemoveMemberPayload,
  UpdateMemberVisibilityPayload,

} from './chat-members.interface';
import { createMembersAction } from './chat-members';

function getMembersAction() {
  return createMembersAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function upsertMembers(payload: AddMembersPayload) {
  return await getMembersAction().upsert(payload);
}

export async function getMembers(chatId: string) {
  return await getMembersAction().list(chatId);
}

export async function getMemberSettings(chatId: string, userId: string) {
  return await getMembersAction().get(chatId, userId);
}

export async function removeMember(payload: RemoveMemberPayload) {
  return await getMembersAction().delete(payload);
}

export async function updateMember(
  payload: UpdateMemberVisibilityPayload,
) {
  return await getMembersAction().update(payload);
}