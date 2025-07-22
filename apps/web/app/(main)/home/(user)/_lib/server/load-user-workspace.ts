import { cache } from 'react';



import { createAccountsApi } from '@kit/accounts/api';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


import { getTeams } from '~/server/actions/team/team.action';
import featureFlagsConfig from '~/config/feature-flags.config';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

const shouldLoadAccounts = featureFlagsConfig.enableTeamAccounts;

export type UserWorkspace = Awaited<ReturnType<typeof loadUserWorkspace>>;

/**
 * @name loadUserWorkspace
 * @description
 * Load the user workspace data. It's a cached per-request function that fetches the user workspace data.
 * It can be used across the server components to load the user workspace data.
 */
export const loadUserWorkspace = cache(workspaceLoader);

async function workspaceLoader() {
  try {
    const client = getSupabaseServerComponentClient();
  const api = createAccountsApi(client);

  const accountsPromise = shouldLoadAccounts
    ? () => api.loadUserAccounts()
    : () => Promise.resolve([]);

  const workspacePromise = api.getAccountWorkspace();

  const [accounts, workspace, user, teams] = await Promise.all([
    accountsPromise(),
    workspacePromise,
    requireUserInServerComponent(),
    getTeams({ organizationIds: [], includeMembers: true, includeAgency: true }),
  ]);

  const agency = Object.values(teams)[0] ?? null;

  const organization = Array.isArray(accounts) ? {
    id: '',
    name: '',
    slug: '',
    picture_url: '',
    statuses: [],
    tags: [],
    embeds: [],
  } : accounts;

  // Get pinned organizations with only necessary fields
  const pinnedOrganizations = !Array.isArray(accounts) 
    ? (accounts.clientOrganizations ?? []).map(org => ({
        id: org.id,
        name: org.name,
        picture_url: org.picture_url ?? undefined
      }))
    : [];
    
  return {
    accounts,
    organization,
    pinnedOrganizations,
    workspace,
    user,
    agency,
  };
  } catch (error) {
    console.log('Error loading user workspace on first render:', error);
    return {
      accounts: [],
      organization: null,
      pinnedOrganizations: [],
      workspace: null,
      user: null,
      agency: null,
    };
  }
}