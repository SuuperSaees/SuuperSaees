import { cache } from 'react';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import featureFlagsConfig from '~/config/feature-flags.config';
import { Database } from '~/lib/database.types';

const shouldLoadAccounts = featureFlagsConfig.enableTeamAccounts;

/**
 * @name loadUserWorkspace
 * @description
 * Load the user workspace data. It's a cached per-request function that fetches the user workspace data.
 * It can be used across the server components to load the user workspace data.
 */
export const loadUserWorkspace = cache(async () => {
  const client = getSupabaseServerComponentClient();

  const accountsPromise = shouldLoadAccounts
    ? () => loadUserAccounts(client)
    : () => Promise.resolve([]);

  const workspacePromise = loadUserAccountWorkspace(client);
  const userPromise = client.auth.getUser();

  const [accounts, workspace, userResult] = await Promise.all([
    accountsPromise(),
    workspacePromise,
    userPromise,
  ]);

  const user = userResult.data.user;

  if (!user) {
    throw new Error('User is not logged in');
  }

  return {
    accounts,
    workspace,
    user,
  };
});

async function loadUserAccountWorkspace(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from('user_account_workspace')
    .select(`*`)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function loadUserAccounts(client: SupabaseClient<Database>) {
  const { data: accounts, error } = await client
    .from('user_accounts')
    .select(`name, slug, picture_url`);

  if (error) {
    throw error;
  }

  return accounts.map(({ name, slug, picture_url }) => {
    return {
      label: name,
      value: slug,
      image: picture_url,
    };
  });
}
