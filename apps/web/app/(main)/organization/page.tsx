import {
  getUserById,
  getUserRole,
} from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClient, getOrganization } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import OrganizationSection from '~/components/organization/organization';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('organizations:organizationTitle'),
  };
};

async function OrganizationsPage() {
  const organization = await getOrganization();

  const organizationOwner = await getUserById(
    organization.owner_id ?? '',
  );

  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  // Create a new object that includes the owner property
  const newOrganization = {
    ...organization,
    owner: organizationOwner ?? null, // Add owner explicitly
  };

  const agency = await getAgencyForClient().catch((err) => {
    console.error(`Error getting agency for client: ${err}`)
    return null
  });

  return (
    <OrganizationSection
      name={newOrganization.name ?? ''}
      logo={newOrganization.picture_url ?? ''}
      owner={newOrganization.owner}
      clientOrganizationId={newOrganization.id ?? ''}
      currentUserRole={userRole ?? ''}
      agencyId={agency?.id ?? ''}
    />
  );
}

export default withI18n(OrganizationsPage);
