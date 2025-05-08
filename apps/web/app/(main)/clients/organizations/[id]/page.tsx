import {
  getUserById,
  getUserRole,
} from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClient, getOrganizationById } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import OrganizationSection from '~/components/organization/organization';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('clients:title'),
  };
};

async function OrganizationsPage({ params }: { params: { id: string } }) {
  const organization = await getOrganizationById(params.id).catch((err) => {
    console.error(`Error getting organization by id: ${err}`)
  });

  const organizationOwner = await getUserById(
    organization?.owner_id ?? '',
  ).catch((err) => {
    console.error(`Error getting organization owner: ${err}`)
    return null
  });
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  const newOrganization = { ...organization, owner: organizationOwner };
  const agency = await getAgencyForClient().catch((err) => {
    console.error(`Error getting agency for client: ${err}`)
    return null
  });

  return (
    <OrganizationSection
      name={newOrganization.name ?? ''}
      logo={newOrganization.picture_url ?? ''}
      owner={newOrganization.owner ?? { id: '', name: '', email: '' }}
      clientOrganizationId={params.id}
      currentUserRole={userRole ?? ''}
      agencyId={agency?.id ?? ''}
    />
  );
}
export default withI18n(OrganizationsPage);
