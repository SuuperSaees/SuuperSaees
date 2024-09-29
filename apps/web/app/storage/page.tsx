import {
  getUserById,
  getUserRole,
  getUserIdOfAgencyOwner,
  getPrimaryOwnerId
} from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClient } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import OrganizationSection from '~/components/organization/organization';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('storage:title'),
  };
};

async function StoragePage() {
  const organizationId = await getUserIdOfAgencyOwner();

  const organization = await getAgencyForClient(organizationId?.account_id ?? '');

  // console.log('organization', organization);

  const organizationOwnerId = await getPrimaryOwnerId();

  const organizationOwner = await getUserById(
    organizationOwnerId ?? '',
  );
  const userRole = await getUserRole();
  const newOrganization = { ...organization, owner: organizationOwner };

  // console.log('organization', newOrganization);
  return (
    <OrganizationSection
      name={newOrganization.name ?? ''}
      logo={newOrganization.picture_url ?? ''}
      owner={newOrganization.owner}
      clientOrganizationId={organizationId?.account_id ?? ''}
      currentUserRole={userRole}
      fromPage='storage'
    />
  );
}
export default withI18n(StoragePage);
