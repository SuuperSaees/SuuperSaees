'use server';

import {
  ChatRoleType,
  validateChatRole,
} from '../chats/middleware/validate_chat_role';
import {
  AddMembersPayload,
  RemoveMemberPayload,
  ResetMemberSettingsPayload,
  UpdateMemberSettingsPayload,
  UpdateMemberVisibilityPayload,
} from './members.interface';
import { createMembersAction } from './members';

function getMembersAction() {
  return createMembersAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function addMembers(payload: AddMembersPayload) {
  return await getMembersAction().addMembers(payload);
}

export async function getMembers(chatId: string) {
  return await getMembersAction().getMembers(chatId);
}

export async function getMemberSettings(chatId: string, userId: string) {
  return await getMembersAction().getMemberSettings(chatId, userId);
}

export async function removeMember(payload: RemoveMemberPayload) {
  return await getMembersAction().removeMember(payload);
}

export async function resetMemberSettings(payload: ResetMemberSettingsPayload) {
  return await getMembersAction().resetMemberSettings(payload);
}

export async function updateMemberVisibility(
  payload: UpdateMemberVisibilityPayload,
) {
  return await getMembersAction().updateMemberVisibility(payload);
}

export async function updateMemberSettings(
  payload: UpdateMemberSettingsPayload,
) {
  return await getMembersAction().updateMemberSettings(payload);
}
