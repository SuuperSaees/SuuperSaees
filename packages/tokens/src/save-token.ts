'use server';

// import { Database } from '../../../apps/web/lib/database.types';
import { Tokens } from '../../../apps/web/lib/tokens.types';
import { getSupabaseServerComponentClient } from '../../supabase/src/clients/server-component.client';

// import { SupabaseClient } from '../../../node_modules/.pnpm/@supabase+supabase-js@2.44.4/node_modules/@supabase/supabase-js/src/index';

const saveToken = async (
  token: Tokens.Insert,
  client?: any, // TODO: fix this
) => {
  client =
    client ??
    getSupabaseServerComponentClient({
      admin: true,
    });
  try {
    const { error } = await client.from('tokens').insert(token);

    if (error) throw `Error saving token: ${error}`;
  } catch (error) {
    console.error(error);
    throw `Error saving token: ${error}`;
  }
};

export { saveToken };
