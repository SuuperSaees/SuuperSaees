import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';
import { Message } from '~/lib/message.types';

export class MessagesRepository {
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
  async createMessage(
    payload: Message.Insert,
  ): Promise<Message.TypeOnly> {
    const client = this.adminClient ?? this.client;
    const { data, error } = await client
      .from('messages')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }

    return data as Message.TypeOnly;
  }
}

