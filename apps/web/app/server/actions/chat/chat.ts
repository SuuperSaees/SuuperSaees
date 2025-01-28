import { BaseAction } from '../base-action';
import {
  AddMembersPayload,
  AddMembersResponse,
  ChatMessagePayload,
  ChatMessageResponse,
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteChatResponse,
  DeleteMessagePayload,
  DeleteMessageResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  GetMembersResponse,
  GetMessagesResponse,
  IChatAction,
  MemberSettingsResponse,
  RemoveMemberPayload,
  RemoveMemberResponse,
  ResetMemberSettingsPayload,
  ResetMemberSettingsResponse,
  UpdateChatSettingsPayload,
  UpdateChatSettingsResponse,
  UpdateMemberSettingsPayload,
  UpdateMemberSettingsResponse,
  UpdateMemberVisibilityPayload,
  UpdateMemberVisibilityResponse,
  UpdateMessageContentPayload,
  UpdateMessageContentResponse,
} from './chat.interfaces';
import { ChatPayload, ChatResponse } from './chat.interfaces';
import { ChatController } from './controllers/chat.controllers';

export class ChatAction extends BaseAction implements IChatAction {
  private controller: ChatController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new ChatController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  // * CREATE ACTIONS
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    return await this.controller.createChat(payload);
  }

  async addMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    return await this.controller.addMembers(payload);
  }

  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    return await this.controller.createMessage(payload);
  }

  // * GET ACTIONS
  async getChats(): Promise<GetChatsResponse[]> {
    return await this.controller.getChats();
  }

  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    return await this.controller.getChatById(chatId);
  }

  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    return await this.controller.getMembers(chatId);
  }

  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    return await this.controller.getMessages(chatId);
  }

  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    return await this.controller.getMemberSettings(chatId, userId);
  }

  // * DELETE ACTIONS
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    return await this.controller.deleteChat(chatId);
  }

  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    return await this.controller.removeMember(payload);
  }

  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    return await this.controller.deleteMessage(payload);
  }

  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    return await this.controller.clearChatMessages(payload);
  }

  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    return await this.controller.resetMemberSettings(payload);
  }

  // * UPDATE ACTIONS
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    return await this.controller.updateChatSettings(payload);
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

  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    return await this.controller.updateMessageContent(payload);
  }
}

export function createChatAction(baseUrl: string) {
  return new ChatAction(baseUrl);
}
