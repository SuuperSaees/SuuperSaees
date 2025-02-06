'use server';
import {
  AddMembersPayload,
  RemoveMemberPayload,
  ResetMemberSettingsPayload,
  UpdateMemberSettingsPayload,
  UpdateMemberVisibilityPayload,

} from './chat-members.interface';
import { createMembersAction } from './chat-members';

function getMembersAction() {
  return createMembersAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function upsertMembers(payload: AddMembersPayload) {
  return await getMembersAction().upsertMembers(payload);
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
