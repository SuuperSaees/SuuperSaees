"use server";

import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";

import { Client } from "~/lib/client.types";
import { Organization } from "~/lib/organization.types";
import { Pagination } from "~/lib/pagination";
import { User } from "~/lib/user.types";

import { QueryBuilder, QueryConfigurations } from "../query.config";
import { transformToPaginatedResponse } from "../utils/response-transformers";
import { transformUser } from "../utils/transformers";

export const getClients = async (
  agencyId: string,
  config?: QueryConfigurations<Client.Response>,
): Promise<Pagination.Response<Client.Response> | Client.Response[]> => {
  const client = getSupabaseServerComponentClient();
  const adminClient = getSupabaseServerComponentClient({
    admin: true,
  });

  const query = client
    .from("clients")
    .select(
      `id, organization_client_id, user_client_id, agency_id, deleted_on,
       user:accounts!inner(id, name, email, picture_url, created_at, settings:user_settings(name, picture_url)), 
      organization:organizations!organization_client_id(id, name, slug, owner_id, picture_url)`,
      config
        ? {
            count: "exact",
          }
        : undefined,
    )
    .eq("agency_id", agencyId)
    .is("deleted_on", null)
    .not("user.email", "like", "guest%@suuper.co")

  const paginatedClients = QueryBuilder.getInstance().enhance(query, config);
  const response = await paginatedClients;

  // Get roles for each client
  const userIds = response.data?.map((client) => client.user_client_id) ?? [];

  const roles = await adminClient
    .from("accounts_memberships")
    .select("account_role, user_id, organization_id")
    .in("user_id", userIds);

  const parsedResponse = transformClients(response.data, roles.data);
  // Check if pagination is requested
  if (config?.pagination) {
    const paginatedResponse = transformToPaginatedResponse<Client.Response>(
      response,
      config.pagination,
    );

    return {
      ...paginatedResponse,
      data: parsedResponse,
    };
  } else {
    // Return non-paginated data
    return parsedResponse;
  }
};

type ClientUnparsed = Pick<
  Client.Type,
  | "id"
  | "agency_id"
  | "organization_client_id"
  | "user_client_id"
  | "deleted_on"
> & {
  user?: User.Response | null;
  organization?:
    | Pick<
        Organization.Type,
        "id" | "name" | "slug" | "owner_id" | "picture_url"
      >[]
    | null;
};

type Role = {
  account_role: string;
  user_id: string;
  organization_id: string | null;
};

const transformClients = (
  clients: ClientUnparsed[] | null,
  roles: Role[] | null,
): Client.Response[] => {
  if (!clients) return [];
  return clients.map((client) => {
    return {
      ...client,
      user: client.user
        ? transformUser({
            ...client.user,
            role:
              roles?.find((role) => role.user_id === client.user_client_id)
                ?.account_role ?? null,
          })
        : null,
      organization: Array.isArray(client.organization)
        ? client.organization[0]
        : (client.organization ?? null),
    };
  });
};

export const getOrganizations = async (
  agencyId: string,
  config: QueryConfigurations<Organization.Response>,
): Promise<
  Pagination.Response<Organization.Response> | Organization.Response[]
> => {
  const client = getSupabaseServerComponentClient();

  try {
    // First, get organization IDs that have clients with the specified agency_id
    const { data: clientOrganizations, error: clientOrganizationsError } =
      await client
        .from("clients")
        .select("organization_client_id")
        .eq("agency_id", agencyId)
        .is("deleted_on", null);

    if (clientOrganizationsError) {
      console.error(
        "Error fetching client organizations:",
        clientOrganizationsError,
      );
      throw new Error("Error fetching client organizations");
    }

    const organizationIds = clientOrganizations.map(
      (c) => c.organization_client_id,
    );

    const query = client
      .from("organizations")
      .select(
        `id, name, slug, owner_id, picture_url, created_at, updated_at,
         owner:accounts!owner_id(id, name, email, picture_url, 
         settings:user_settings(name, picture_url))`,
        config.pagination
          ? {
              count: "exact",
            }
          : undefined,
      )
      .in("id", organizationIds)
      .not("name", "ilike", "guest%organization");

    if (config.pagination) {
      const paginatedOrganizations = QueryBuilder.getInstance().enhance(
        query,
        config,
      );
      const response = await paginatedOrganizations;
      const parsedResponse = transformOrganizations(response.data ?? []);
      const paginatedResponse =
        transformToPaginatedResponse<Organization.Response>(
          response,
          config.pagination,
        );
      return {
        ...paginatedResponse,
        data: parsedResponse,
      };
    } else {
      const response = await query;
      return transformOrganizations(response.data ?? []);
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};

type OrganizationUnparsed = Pick<
  Organization.Type,
  "id" | "name" | "slug" | "owner_id" | "picture_url"
> & {
  owner?: User.Response[] | null;
};
const transformOrganizations = (
  organizations: OrganizationUnparsed[],
): Organization.Response[] => {
  return organizations.map((organization) => {
    return {
      ...organization,
      owner: organization.owner
        ? Array.isArray(organization.owner)
          ? transformUser(organization?.owner?.[0])
          : transformUser(organization?.owner)
        : null,
    };
  });
};
