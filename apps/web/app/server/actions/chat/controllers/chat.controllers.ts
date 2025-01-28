import { SupabaseClient } from '@supabase/supabase-js';

import {
  AddMembersPayload,
  AddMembersResponse,
  ChatMessagePayload,
  ChatMessageResponse,
  ChatPayload,
  ChatResponse,
  ClearChatMessagesPayload,
  ClearChatMessagesResponse,
  DeleteChatResponse,
  DeleteMessagePayload,
  DeleteMessageResponse,
  GetChatByIdResponse,
  GetChatsResponse,
  GetMembersResponse,
  GetMessagesResponse,
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
} from '../chat.interfaces';
import { ChatService } from '../services/chat.services';

export class ChatController {
  private baseUrl: string;
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(
    baseUrl: string,
    client: SupabaseClient,
    adminClient: SupabaseClient,
  ) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE CONTROLLERS
  /**
   * @name createChat
   * @description Crea un nuevo chat. No agrega miembros, solo crea el chat y devuelve su respuesta.
   * @param {ChatPayload} payload - Datos necesarios para crear el chat.
   * @returns {Promise<ChatResponse>} Respuesta con el chat creado.
   * @throws {Error} Si falta información importante para la creación del chat.
   */
  async createChat(payload: ChatPayload): Promise<ChatResponse> {
    if (!payload.name || !payload.user_id) {
      throw new Error(
        'Faltan datos requeridos para crear el chat: nombre o user_id.',
      );
    }

    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.createChat(payload);
  }

  /**
   * @name addMembers
   * @description Server action to add members to an existing chat.
   * Adds members by delegating to the chat action and returns the result.
   * @param {AddMembersPayload} payload - Datos que contienen el chat_id y los miembros a agregar.
   * @returns {Promise<AddMembersResponse>} Respuesta indicando el resultado de agregar los miembros.
   */
  async addMembers(payload: AddMembersPayload): Promise<AddMembersResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.addMembersToChat(payload);
  }

  /**
   * @name createMessage
   * @description Crea un nuevo mensaje dentro de un chat. El mensaje se almacena en la base de datos
   * y se devuelve la respuesta con el mensaje creado.
   * @param {ChatMessagePayload} payload - Datos del mensaje a crear (chat_id, user_id, content, etc.).
   * @returns {Promise<ChatMessageResponse>} Respuesta con el mensaje creado.
   */
  async createMessage(
    payload: ChatMessagePayload,
  ): Promise<ChatMessageResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.createMessage(payload);
  }

  // * GET CONTROLLERS
  /**
   * @name getChats
   * @description Obtiene todos los chats a los que el usuario tiene acceso, ya sea por ser miembro o por ser dueño.
   * @returns {Promise<GetChatsResponse[]>} Lista de chats a los que el usuario puede acceder.
   */
  async getChats(): Promise<GetChatsResponse[]> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.getChats();
  }

  /**
   * @name getChatById
   * @description Obtiene los detalles de un chat específico, incluyendo miembros y mensajes.
   * @param {string} chatId - ID del chat a obtener.
   * @returns {Promise<GetChatByIdResponse>} Detalles del chat.
   */
  async getChatById(chatId: string): Promise<GetChatByIdResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.getChatById(chatId);
  }

  /**
   * @name getMembers
   * @description Retrieves all members of a specific chat from the service.
   * @param {string} chatId - The ID of the chat to fetch members for.
   * @returns {Promise<GetMembersResponse[]>} List of members with their roles and settings.
   */
  async getMembers(chatId: string): Promise<GetMembersResponse[]> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.getMembers(chatId);
  }

  /**
   * @name getMessages
   * @description Retrieves all messages from a specific chat via the service.
   * @param {string} chatId - The ID of the chat to fetch messages from.
   * @returns {Promise<GetMessagesResponse[]>} List of messages in the chat.
   */
  async getMessages(chatId: string): Promise<GetMessagesResponse[]> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.getMessages(chatId);
  }

  /**
   * @name getMemberSettings
   * @description Retrieves the settings of a specific member in a chat via the service.
   * @param {string} chatId - The ID of the chat
   * @param {string} userId - The ID of the user
   * @returns {Promise<MemberSettingsResponse>} The member's settings in the chat.
   */
  async getMemberSettings(
    chatId: string,
    userId: string,
  ): Promise<MemberSettingsResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.getMemberSettings(chatId, userId);
  }

  // * DELETE CONTROLLERS
  /**
   * @name deleteChat
   * @description Deletes a chat by its ID. Validates that the user is authorized to perform the action.
   * @param {string} chatId - ID of the chat to delete.
   * @returns {Promise<DeleteChatResponse>} Response indicating the result of the deletion.
   */
  async deleteChat(chatId: string): Promise<DeleteChatResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.deleteChat(chatId);
  }

  /**
   * @name removeMember
   * @description Removes a member from a chat by delegating to the service layer.
   * @param {RemoveMemberPayload} payload - Data containing the chat ID and user ID to remove.
   * @returns {Promise<RemoveMemberResponse>} Response indicating the result of the removal.
   */
  async removeMember(
    payload: RemoveMemberPayload,
  ): Promise<RemoveMemberResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.removeMember(payload);
  }

  /**
   * @name deleteMessage
   * @description Deletes a specific message from a chat by delegating to the service layer.
   * @param {DeleteMessagePayload} payload - Data containing the chat ID and message ID to delete.
   * @returns {Promise<DeleteMessageResponse>} Response indicating the result of the deletion.
   */
  async deleteMessage(
    payload: DeleteMessagePayload,
  ): Promise<DeleteMessageResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.deleteMessage(payload);
  }

  /**
   * @name clearChatMessages
   * @description Clears all messages in a specific chat by delegating to the service layer.
   * @param {ClearChatMessagesPayload} payload - Data containing the chat ID.
   * @returns {Promise<ClearChatMessagesResponse>} Response indicating the result of the clearing operation.
   */
  async clearChatMessages(
    payload: ClearChatMessagesPayload,
  ): Promise<ClearChatMessagesResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.clearChatMessages(payload);
  }

  /**
   * @name resetMemberSettings
   * @description Resets the settings of a specific member in a chat by delegating to the service layer.
   * @param {ResetMemberSettingsPayload} payload - Data containing the chat ID and user ID.
   * @returns {Promise<ResetMemberSettingsResponse>} Response indicating the result of the reset operation.
   */
  async resetMemberSettings(
    payload: ResetMemberSettingsPayload,
  ): Promise<ResetMemberSettingsResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );

    return await service.resetMemberSettings(payload);
  }

  // * UPDATE CONTROLLERS
  /**
   * @name updateChatSettings
   * @description Updates the settings of a chat.
   * @param {UpdateChatSettingsPayload} payload - Data required to update the settings.
   * @returns {Promise<UpdateChatSettingsResponse>} Response indicating the result of the operation.
   */
  async updateChatSettings(
    payload: UpdateChatSettingsPayload,
  ): Promise<UpdateChatSettingsResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.updateChatSettings(payload);
  }

  /**
   * @name updateMemberVisibility
   * @description Updates the visibility of a member in a chat.
   * @param {UpdateMemberVisibilityPayload} payload - Data required for the operation.
   * @returns {Promise<UpdateMemberVisibilityResponse>} Response indicating the result of the operation.
   */
  async updateMemberVisibility(
    payload: UpdateMemberVisibilityPayload,
  ): Promise<UpdateMemberVisibilityResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.updateMemberVisibility(payload);
  }

  /**
   * @name updateMemberSettings
   * @description Updates the settings of a member in a chat.
   * @param {UpdateMemberSettingsPayload} payload - Data required to update the settings.
   * @returns {Promise<UpdateMemberSettingsResponse>} Response indicating the success or failure of the operation.
   */
  async updateMemberSettings(
    payload: UpdateMemberSettingsPayload,
  ): Promise<UpdateMemberSettingsResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.updateMemberSettings(payload);
  }

  /**
   * @name updateMessageContent
   * @description Updates the content of a specific message in a chat.
   * @param {UpdateMessageContentPayload} payload - Data required to update the message.
   * @returns {Promise<UpdateMessageContentResponse>} Response indicating the success or failure of the operation.
   */
  async updateMessageContent(
    payload: UpdateMessageContentPayload,
  ): Promise<UpdateMessageContentResponse> {
    const service = new ChatService(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
    return await service.updateMessageContent(payload);
  }
}
