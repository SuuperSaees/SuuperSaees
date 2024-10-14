import { getSupabaseServerComponentClient } from '../../supabase/src/clients/server-component.client';


const supabase = getSupabaseServerComponentClient({
  admin: true,
});

export async function getDomainByUserId(
  userId: string,
  parsedUrl: boolean = false,
): Promise<string> {
  const { data: userData, error: userError } = await supabase
    .from('accounts_memberships')
    .select('account_role')
    .eq('user_id', userId)
    .single();

  if (userError) {
    throw new Error(`Error getting user role: ${userError.message}`);
  }

  const userRole = userData?.account_role;
  const availableRolesAgency = new Set([
    'agency_member',
    'agency_owner',
    'agency_project_manager',
  ]);
  const availableRolesClient = new Set(['client_owner', 'client_member']);

  let organizationId: string | null = null;

  if (availableRolesAgency.has(userRole)) {
    // Case 1: Agency roles
    const { data: organizationData, error: organizationError } = await supabase
      .from('accounts')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (organizationError) {
      throw new Error(
        `Error getting organization: ${organizationError.message}`,
      );
    }

    organizationId = organizationData?.organization_id;
  } else if (availableRolesClient.has(userRole)) {
    // Case 2: Client roles
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('agency_id')
      .eq('user_client_id', userId)
      .single();

    if (clientError) {
      throw new Error(`Error getting client: ${clientError.message}`);
    }

    organizationId = clientData?.agency_id;
  } else {
    // Unknown role, use default domain
    return process.env.NEXT_PUBLIC_SITE_URL!;
  }

  const { data: domainData, error: domainError } = await supabase
    .from('organization_subdomains')
    .select('subdomains(domain)')
    .eq('organization_id', organizationId ?? '')
    .single();

  if (domainError) {
    throw new Error(`Error getting domain: ${domainError.message}`);
  }

  const domain = domainData?.subdomains?.domain;
  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

  if (parsedUrl) {
    return `${IS_PROD ? 'https' : 'http'}://${domain}/`;
  }

  return domain || process.env.NEXT_PUBLIC_SITE_URL!;
}