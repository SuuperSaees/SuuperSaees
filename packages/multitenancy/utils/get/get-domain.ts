'use server';

import { getUserRoleById } from '../../../features/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClientByUserId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getOrganizationByUserId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getOrganizationSettingsByOrganizationId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getSupabaseServerComponentClient } from '../../../supabase/src/clients/server-component.client';


export async function getDomainByUserId(
  userId: string,
  parsedUrl: boolean = false,
): Promise<{
  domain: string;
  organizationId: string;
}> {
  // GET ROLE
  try {
    const userRole = await getUserRoleById(userId);
    const availableRolesAgency = new Set([
      'agency_member',
      'agency_owner',
      'agency_project_manager',
    ]);
    const availableRolesClient = new Set(['client_owner', 'client_member']);
    let organizationId: string | null = null;

    if (availableRolesAgency.has(userRole)) {
      // Case 1: Agency roles
      const organizationData = await getOrganizationByUserId(userId);

      organizationId = organizationData?.id;
    } else if (availableRolesClient.has(userRole)) {
      // Case 2: Client roles
      const agencyData = await getAgencyForClientByUserId(userId);

      organizationId = agencyData?.id;
    } else {
      // Unknown role, use default domain
      return {
        domain: process.env.NEXT_PUBLIC_SITE_URL ?? '',
        organizationId: '',
      };
    }

    const domain =
      (await getDomainByOrganizationId(organizationId)) ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      '';
    const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

    return {
      domain: parsedUrl ? `${IS_PROD ? 'https' : 'http'}://${domain}/` : domain,
      organizationId: organizationId,
    };
  } catch (error) {
    console.error(error);
    return {
      domain: process.env.NEXT_PUBLIC_SITE_URL ?? '',
      organizationId: '',
    };
  }
}

export async function getDomainByOrganizationId(
  organizationId: string,
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

  const domain =
    domainData?.subdomains?.domain ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';

  return domain;
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
    throw new Error(`Error getting domain by subdomain: ${domainError.message}`);
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
    const { data: organizationSubdomainData, error: organizationSubdomainError } =
      await supabase
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
      throw new Error(`No organization subdomain found for subdomain: ${subdomain}`);
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