import {
  getUserById,
  getUserRole,
} from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrganizationById } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

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
  const organization = await getOrganizationById(params.id);

  // console.log('organization', organization);

  const organizationOwner = await getUserById(
    organization.primary_owner_user_id,
  );
  const userRole = await getUserRole();
  const newOrganization = { ...organization, owner: organizationOwner };

  // console.log('organization', newOrganization);
  return (
    <OrganizationSection
      name={newOrganization.name}
      logo={newOrganization.picture_url ?? ''}
      owner={newOrganization.owner}
      clientOrganizationId={params.id}
      currentUserRole={userRole}
    />
  );
}
export default withI18n(OrganizationsPage);
