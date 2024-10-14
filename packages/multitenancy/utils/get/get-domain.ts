'use server';

import { getUserRoleById } from '../../../features/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClientByUserId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getOrganizationByUserId } from '../../../features/team-accounts/src/server/actions/organizations/get/get-organizations';
import { getSupabaseServerComponentClient } from '../../../supabase/src/clients/server-component.client';

export async function getDomainByUserId(
  userId: string,
  parsedUrl: boolean = false,
): Promise<string> {
  // GET ROLE
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
    return process.env.NEXT_PUBLIC_SITE_URL!;
  }

  const domain = await getDomainByOrganizationId(organizationId);
  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

  if (parsedUrl) {
    return `${IS_PROD ? 'https' : 'http'}://${domain}/`;
  }

  return domain || process.env.NEXT_PUBLIC_SITE_URL!;
}

export async function getDomainByOrganizationId(
  organizationId: string,
): Promise<string> {
  const supabase = getSupabaseServerComponentClient();
  const { data: domainData, error: domainError } = await supabase
    .from('organization_subdomains')
    .select('subdomains(domain)')
    .eq('organization_id', organizationId ?? '')
    .single();

  if (domainError) {
    throw new Error(`Error getting domain: ${domainError.message}`);
  }

  const domain = domainData?.subdomains?.domain;

  return domain ?? '';
}
