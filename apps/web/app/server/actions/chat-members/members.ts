import { BaseAction } from '../base-action';
import { MembersController } from './controllers/members.controllers';
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
} from './members.interface';

export class MembersAction extends BaseAction {
  private controller: MembersController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new MembersController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async addMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    return await this.controller.addMembers(payload);
  }

  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    return await this.controller.getMembers(chatId);
  }

  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.controller.getMemberSettings(chatId, userId);
  }

  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    return await this.controller.removeMember(payload);
  }

  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    return await this.controller.resetMemberSettings(payload);
  }

  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    return await this.controller.updateMemberVisibility(payload);
  }

  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    return await this.controller.updateMemberSettings(payload);
  }
}

export function createMembersAction(baseUrl: string) {
  return new MembersAction(baseUrl);
}
