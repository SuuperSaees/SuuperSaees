'use server';

import { Account } from '../../../../apps/web/lib/account.types';
import { getUserAccountById, getUserRoleById } from '../../../features/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClientByUserId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getOrganizationByUserId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getOrganizationSettingsByOrganizationId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getSupabaseServerComponentClient } from '../../../supabase/src/clients/server-component.client';


export async function getDomainByUserId(
  userId: string,
  parsedUrl: boolean = false,
  includeDomainOwnerEmail?: boolean,
): Promise<{
  domain: string;
  organizationId: string | null;
  ownerEmail: string | null;
  organization: null | Pick<Account.Type, 'name'>;
}> {
  try {
    const client = getSupabaseServerComponentClient();
    const userRole = await getUserRoleById(userId) ?? '';
    const availableRolesAgency = new Set([
      'agency_member',
      'agency_owner',
      'agency_project_manager',
    ]);
    const availableRolesClient = new Set(['client_owner', 'client_member', 'client_guest']);
    let organizationId: string | null = null;
    let ownerEmail: null | string = null;
    let organization: null | Pick<
      Account.Type,
      'name'
    > = null;
     const getOwnerEmail = async (id: string | undefined) => {
      if (!id) return null;
  
    if (includeDomainOwnerEmail) {
      const domainOwnerAccount = await getUserAccountById(client, id);
      ownerEmail = domainOwnerAccount?.email ?? null;
      return ownerEmail;
    }
    return null;
    };
     if (availableRolesAgency.has(userRole)) {
      // Case 1: Agency roles
      const organizationData = await getOrganizationByUserId(userId);
      organization = organizationData;
      organizationId = organizationData?.id ?? null;
      ownerEmail = await getOwnerEmail(organizationData?.primary_owner_user_id);
    } else if (availableRolesClient.has(userRole)) {
      // Case 2: Client roles
      const agencyData = await getAgencyForClientByUserId(userId);
      organization = agencyData;
      ownerEmail = await getOwnerEmail(agencyData?.primary_owner_user_id);
      organizationId = agencyData?.id ?? null;
    } else {
      // Unknown role, use default domain
      return {
        domain: process.env.NEXT_PUBLIC_SITE_URL ?? '',
        organizationId: null,
        organization,
        ownerEmail,
      };
    }
     const domain =
      (await getDomainByOrganizationId(organizationId)) ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      '';
    const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
     return {
      domain: parsedUrl ? `${IS_PROD ? 'https' : 'http'}://${domain}/` : domain,
      organizationId,
      organization,
      ownerEmail,
    };
  } catch (error) {
    console.error('Error getting domain by user id:', error);
    return {
      domain: process.env.NEXT_PUBLIC_SITE_URL ?? '',
      organizationId: null,
      organization: null,
      ownerEmail: null,
    };
  }
}

export async function getDomainByOrganizationId(
  organizationId: string | null,
  parsedUrl = false,
  adminActived = false,
): Promise<string> {
  const supabase = getSupabaseServerComponentClient({ admin: adminActived });
  const { data: domainData, error: domainError } = await supabase
    .from('organization_subdomains')
    .select('subdomains(domain)')
    .eq('organization_id', organizationId ?? '')
    .single();

  if (domainError) {
    throw new Error(`Error getting domain: ${domainError.message}`);
  }

  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
  const subdomains = Array.isArray(domainData?.subdomains)
    ? domainData?.subdomains[0]
    : (domainData?.subdomains as unknown as { domain: string });

  const domain = subdomains?.domain;

  return parsedUrl
    ? `${IS_PROD ? 'https' : 'http'}://${domain}/`
    : (domain ?? process.env.NEXT_PUBLIC_SITE_URL ?? '');
}

export async function getDomainBySubdomain(
  subdomain: string,
  adminActived = false,
): Promise<{
  domain: string;
  id: string;
}> {
  const supabase = getSupabaseServerComponentClient({ admin: adminActived });
  const { data: domainData, error: domainError } = await supabase
    .from('subdomains')
    .select('domain, id')
    .eq('domain', subdomain)
    .single();

  if (domainError) {
    throw new Error(
      `Error getting domain by subdomain: ${domainError.message}`,
    );
  }

  return domainData;
}

export async function getFullDomainBySubdomain(
  subdomain: string,
  adminActived: boolean = false,
  values: string[] = [],
) {
  try {
    const supabase = getSupabaseServerComponentClient({
      admin: adminActived,
    });

    // Fetch domain data and handle possible errors
    const domainData = await getDomainBySubdomain(subdomain, adminActived);

    // Fetch organization subdomain data and handle errors
    const {
      data: organizationSubdomainData,
      error: organizationSubdomainError,
    } = await supabase
      .from('organization_subdomains')
      .select('organization_id')
      .eq('subdomain_id', domainData.id)
      .single();

    if (organizationSubdomainError) {
      throw new Error(
        `Error getting organization subdomain: ${organizationSubdomainError.message}`,
      );
    }

    if (!organizationSubdomainData) {
      throw new Error(
        `No organization subdomain found for subdomain: ${subdomain}`,
      );
    }

    // Fetch organization settings and handle possible errors
    const organizationSettings = await getOrganizationSettingsByOrganizationId(
      organizationSubdomainData.organization_id,
      true,
      values,
    );

    // Return relevant data
    return {
      domainData,
      settings: organizationSettings,
    };
  } catch (error) {
    console.error(`Error in getFullDomainBySubdomain: ${error}`);
    throw new Error(`Failed to get full domain by subdomain: ${error}`);
  }
}