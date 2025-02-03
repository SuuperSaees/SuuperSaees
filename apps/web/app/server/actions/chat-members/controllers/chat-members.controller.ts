import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

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
} from '../chat-members.interface';
import { MembersRepository } from '../repositories/chat-members.repository';
import { MembersService } from '../services/chat-members.service';

export class MembersController {
  private membersService: MembersService;

  constructor(
    baseUrl: string,
    client: SupabaseClient<Database>,
    adminClient: SupabaseClient<Database>,
  ) {
    const membersRepository = new MembersRepository(client, adminClient);
    this.membersService = new MembersService(membersRepository);
  }

  // * CREATE CONTROLLERS
  async upsertMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    try {
      return await this.membersService.upsertMembers(payload);
    } catch (error) {

      console.error(error);
      throw error;
    }
  }

  // * GET CONTROLLERS
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    try {
      return await this.membersService.getMembers(chatId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    try {
      return await this.membersService.getMemberSettings(chatId, userId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * DELETE CONTROLLERS
  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    try {
      return await this.membersService.removeMember(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    try {
      return await this.membersService.resetMemberSettings(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // * UPDATE CONTROLLERS
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    try {
      return await this.membersService.updateMemberSettings(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    try {
      return await this.membersService.updateMemberVisibility(payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
