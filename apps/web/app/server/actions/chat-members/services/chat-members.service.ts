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

export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  // * CREATE SERVICES
  async addMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    return await this.membersRepository.addMembers(
      payload.chat_id,
      payload.members,
    );
  }

  // * GET SERVICES
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    return await this.membersRepository.getMembers(chatId);
  }

  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.membersRepository.getMemberSettings(chatId, userId);
  }

  // * DELETE SERVICES
  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    return await this.membersRepository.removeMember(
      payload.chat_id,
      payload.user_id,
    );
  }

  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    return await this.membersRepository.resetMemberSettings(
      payload.chat_id,
      payload.user_id,
    );
  }

  // * UPDATE SERVICES
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    return await this.membersRepository.updateMemberSettings(payload);
  }

  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    return await this.membersRepository.updateMemberVisibility(payload);
  }
}
