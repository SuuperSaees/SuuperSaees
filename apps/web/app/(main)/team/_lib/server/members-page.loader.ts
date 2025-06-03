'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { hasPermissionToAddTeamMembers } from 'node_modules/@kit/team-accounts/src/server/actions/permissions/permissions';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { loadTeamWorkspace } from '~/(main)/home/[account]/_lib/server/team-account-workspace.loader';
import { Database } from '~/lib/database.types';
import { Pagination } from '~/lib/pagination';
import { User } from '~/lib/user.types';
import { QueryBuilder } from '~/server/actions/query.config';
import { QueryConfigurations } from '~/server/actions/query.config';
import { transformToPaginatedResponse } from '~/server/actions/utils/response-transformers';

export type Member = {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  role_hierarchy_level: number;
  owner_user_id: string;
  name: string;
  email: string;
  picture_url: string;
  created_at: string;
  updated_at: string;
  settings: {
    name: string;
    picture_url: string;
  };
};

/**
 * Load data for the members page
 * @param client
 * @param slug
 */
export async function loadMembersPageData(
  client: SupabaseClient<Database>,
  slug: string,
  organizationId: string,
  config?: QueryConfigurations<User.Type>,
) {
  return Promise.all([
    loadPaginatedAccountMembers(organizationId, config ?? {}),
    loadInvitations(client, slug),
    canAddMember,
    loadTeamWorkspace(slug),
  ]);
}

/**
 * @name canAddMember
 * @description Check if the current user can add a member to the account
 *
 * This needs additional logic to determine if the user can add a member to the account
 * Please implement the logic and return a boolean value
 *
 * The same check needs to be added when creating an invitation
 *
 */
async function canAddMember() {
  return await hasPermissionToAddTeamMembers();
}

/**
 * Load account members (unused - kept for reference)
 * @param client
 * @param account
 */
async function _loadAccountMembers(
  client: SupabaseClient<Database>,
  account: string,
) {
  const { data, error } = await client.rpc('get_account_members', {
    organization_slug: account,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  const owners = (data ?? []).filter(
    (member) => member.role === 'agency_owner',
  );
  const nonOwners = (data ?? [])
    .filter((member) => member.role !== 'agency_owner')
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return [...owners, ...nonOwners];
}

export async function loadPaginatedAccountMembers(
  organizationId: string,
  config: QueryConfigurations<User.Type> = {},
): Promise<Pagination.Response<Member>> {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  try {
    // First get all user_ids from memberships for this organization
    const { data: memberships, error: membershipsError } = await client
      .from('accounts_memberships')
      .select('user_id, account_role, created_at, updated_at')
      .eq('organization_id', organizationId);

    if (membershipsError) {
      console.error(membershipsError);
      throw new Error(
        `Error fetching memberships: ${membershipsError.message}`,
      );
    }

    const userIds = memberships?.map((m) => m.user_id) || [];

    if (userIds.length === 0) {
      return transformToPaginatedResponse<Member>(
        { data: [], error: null, count: 0, status: 200, statusText: 'OK' },
        config?.pagination ?? {},
      );
    }

    // Apply QueryBuilder pagination and filtering to accounts table
    const initialQuery = client
      .from('accounts')
      .select('*', {
        count: 'exact',
      })
      .in('id', userIds)
      .is('deleted_on', null);

    // Apply QueryBuilder with the original config for accounts
    const paginatedQuery = QueryBuilder.getInstance().enhance(
      initialQuery,
      config,
    );

    const accountsResponse = await paginatedQuery;

    if (accountsResponse.error) {
      console.error(accountsResponse.error);
      throw new Error(
        `Error fetching accounts: ${accountsResponse.error.message}`,
      );
    }

    const accounts = accountsResponse.data || [];

    if (accounts.length === 0) {
      return transformToPaginatedResponse<Member>(
        { ...accountsResponse, data: [] },
        config?.pagination ?? {},
      );
    }

    // Get organization and roles data
    const [organizationData, rolesData] = await Promise.all([
      client
        .from('organizations')
        .select('id, owner_id')
        .eq('id', organizationId)
        .is('deleted_on', null)
        .single(),
      client.from('roles').select('name, hierarchy_level'),
    ]);

    if (organizationData.error) {
      console.error(organizationData.error);
      throw new Error(
        `Error fetching organization: ${organizationData.error.message}`,
      );
    }

    if (rolesData.error) {
      console.error(rolesData.error);
      throw new Error(`Error fetching roles: ${rolesData.error.message}`);
    }

    // Transform the paginated accounts to include membership data
    const transformedData: Member[] = accounts.map((account) => {
      const membership = memberships?.find((m) => m.user_id === account.id);
      const role = rolesData.data?.find(
        (r) => r.name === membership?.account_role,
      );

      return {
        id: account.id,
        user_id: account.id,
        organization_id: organizationId,
        role: membership?.account_role ?? '',
        role_hierarchy_level: role?.hierarchy_level ?? 0,
        owner_user_id: organizationData.data?.owner_id ?? '',
        name: account.name ?? '',
        email: account.email ?? '',
        picture_url: account.picture_url ?? '',
        created_at: membership?.created_at ?? account.created_at ?? '',
        updated_at: membership?.updated_at ?? account.updated_at ?? '',
        settings: {
          name: account.name ?? '',
          picture_url: account.picture_url ?? '',
        },
      };
    });

    // Sort the transformed data (owners first, then by created_at)
    const owners = transformedData.filter(
      (member) => member.role === 'agency_owner',
    );
    const nonOwners = transformedData
      .filter((member) => member.role !== 'agency_owner')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

    const sortedData = [...owners, ...nonOwners];

    // Return using transformToPaginatedResponse with the sorted data
    const paginatedResponse = transformToPaginatedResponse<Member>(
      { ...accountsResponse, data: sortedData },
      config?.pagination ?? {},
    );
    console.log(paginatedResponse);
    return paginatedResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Load account invitations
 * @param client
 * @param account
 */
async function loadInvitations(
  client: SupabaseClient<Database>,
  account: string,
) {
  const { data, error } = await client.rpc('get_account_invitations', {
    organization_slug: account,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}
