import { BaseAction } from '../base-action';
import { MembersController } from './controllers/chat-members.controller';
import {
  AddMembersPayload,
  AddMembersResponse,
  GetMembersResponse,
  MemberSettingsResponse,
  RemoveMemberPayload,
  RemoveMemberResponse,
  UpdateMemberVisibilityPayload,
  UpdateMemberVisibilityResponse,
} from './chat-members.interface';

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

  async upsert(payload: AddMembersPayload): Promise<AddMembersResponse> {
    return await this.controller.upsertMembers(payload);
  }

  async list(chatId: string): Promise<GetMembersResponse[]> {
    return await this.controller.getMembers(chatId);
  }

  async get(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.controller.getMemberSettings(chatId, userId);
  }

  async delete(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    return await this.controller.removeMember(payload);
  }

  async update(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    return await this.controller.updateMemberVisibility(payload);
  }
}

export function createMembersAction(baseUrl: string) {
  return new MembersAction(baseUrl);
}

