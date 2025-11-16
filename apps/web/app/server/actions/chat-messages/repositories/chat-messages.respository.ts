import { SupabaseClient } from '@supabase/supabase-js';

import { ChatMessages } from '~/lib/chat-messages.types';
import { Database } from '~/lib/database.types';
import { Message } from '~/lib/message.types';
import { transformDataArray } from '../../utils/transformers';

export class ChatMessagesRepository {
  private client: SupabaseClient<Database>;
  private adminClient?: SupabaseClient<Database>;

  constructor(
    client: SupabaseClient<Database>,
    adminClient?: SupabaseClient<Database>,
  ) {
    this.client = client;
    this.adminClient = adminClient;
  }

  // * CREATE REPOSITORIES
  async create(
    payload: ChatMessages.Insert,
  ): Promise<ChatMessages.TypeWithRelations> {
    const client = this.adminClient ?? this.client;

    const { data, error } = await client
      .from('chat_messages')
      .insert(payload)
      .select(
        `
        *,
        messages:messages(*)
      `,
      )
      .single();

    if (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }

    return data as unknown as ChatMessages.TypeWithRelations;
  }

  // * GET REPOSITORIES
  async list(
    chatId?: string | number,
    config?: ChatMessages.Configuration,
  ): Promise<Message.Response> {
    const client = this.adminClient ?? this.client;
    const limit = config?.pagination?.limit ?? 10;
    let baseQuery = client
      .from('messages')
      .select(
        '*, user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url)), files(*)',
      )
      .eq(
        `${typeof chatId === 'string' ? 'chat_id' : 'order_id'}`,
        chatId ?? '',
      )
      .order('created_at', { ascending: false })
      .limit(limit + 1) // +1 to check if there are more messages and we can provide the next cursor
      .is('deleted_on', null);

    if (config?.pagination) {
      baseQuery = baseQuery.lt('created_at', config.pagination.cursor);
    }

    if (config?.pagination?.endCursor) {
      baseQuery = baseQuery.gte('created_at', config.pagination.endCursor);
    }

    const { data, error } = await baseQuery;

    if (error) {
      throw new Error(
        `Error fetching messages for chat ${chatId}: ${error.message}`,
      );
    }

    const transformedData = transformDataArray(data);
    return {
      data: transformedData.slice(0, limit),
      nextCursor:
        transformedData.length > limit
          ? (transformedData.slice(limit)[0]?.created_at ?? null)
          : null,
    };
  }

  async listLastMessages(
    chatIds?: string[],
  ): Promise<ChatMessages.TypeWithRelations[]> {
    const client = this.client;

    // here we can qyery to accounts_memberships ---> accounts
    const { data, error } = await client
      .from('chat_messages')
      .select(
        `
        *,
        messages!inner(*, user:accounts(id, name, email, picture_url))
      `,
      )
      .in('chat_id', chatIds ?? [])
      .is('messages.deleted_on', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching last messages: ${error.message}`);
    }

    return data as unknown as ChatMessages.TypeWithRelations[];
  }

  // * DELETE REPOSITORIES
  async delete({
    chat_id,
    message_id,
  }: {
    chat_id?: string;
    message_id?: string;
  }): Promise<void> {
    const client = this.client;
    const baseQuery = client
      .from('messages')
      .update({ deleted_on: new Date().toISOString() });

    try {
      if (chat_id && message_id) {
        const { error } = await baseQuery
          .eq('chat_id', chat_id)
          .eq('message_id', message_id);

        if (error) throw error;
        return;
      }

      if (chat_id) {
        const { error } = await baseQuery.eq('chat_id', chat_id);
        if (error) throw error;
        return;
      }

      if (message_id) {
        const { error } = await baseQuery.eq('id', message_id);
        if (error) throw error;
        return;
      }
    } catch (error: unknown) {
      const context =
        chat_id && message_id
          ? `message ${message_id} from chat ${chat_id}`
          : chat_id
            ? `messages from chat ${chat_id}`
            : `message ${message_id}`;

      throw new Error(
        `Error deleting ${context}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // * UPDATE REPOSITORIES
  async update(
    payload: ChatMessages.Update,
  ): Promise<ChatMessages.TypeWithRelations> {
    const client = this.adminClient ?? this.client;

    const { data, error } = await client
      .from('chat_messages')
      .update(payload)
      .eq('chat_id', payload.chat_id ?? '')
      .eq('message_id', payload.message_id ?? '')
      .select(
        `
        *,
        messages:messages(*)
      `,
      )

      .single();

    if (error) {
      throw new Error(`Error updating chat message: ${error.message}`);
    }

    return data as unknown as ChatMessages.TypeWithRelations;
  }
}
