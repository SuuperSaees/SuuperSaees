import { SupabaseClient } from '@supabase/supabase-js';

import {
  AddMembersPayload,
  AddMembersResponse,
  GetMembersResponse,
  MemberSettingsResponse,
  RemoveMemberPayload,
  RemoveMemberResponse,
  ResetMemberSettingsPayload,
  ResetMemberSettingsResponse,
  UpdateMemberSettingsPayload,
  UpdateMemberSettingsResponse,
  UpdateMemberVisibilityPayload,
  UpdateMemberVisibilityResponse,
} from '../../interfaces/chat.interfaces';
import { MembersService } from '../../services/memberss/members.services';

export class MembersController {
  private membersService: MembersService;

  constructor(
    baseUrl: string,
    client: SupabaseClient,
    adminClient: SupabaseClient,
  ) {
    this.membersService = new MembersService(baseUrl, client, adminClient);
  }

  // * CREATE CONTROLLERS
  async addMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    return await this.membersService.addMembers(payload);
  }

  // * GET CONTROLLERS
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    return await this.membersService.getMembers(chatId);
  }

  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.membersService.getMemberSettings(chatId, userId);
  }

  // * DELETE CONTROLLERS
  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    return await this.membersService.removeMember(payload);
  }

  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    return await this.membersService.resetMemberSettings(payload);
  }

  // * UPDATE CONTROLLERS
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    return await this.membersService.updateMemberSettings(payload);
  }

  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    return await this.membersService.updateMemberVisibility(payload);
  }
}
