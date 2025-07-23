import {
  getPrimaryOwnerId,
  getUserById,
  getUserRole,
} from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import {
  getAgencyForClient,
  getOrganization,
} from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import Header from '~/components/organization/header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import FilesView from './components/file-view';
import { PageBody } from '@kit/ui/page';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('storage:title'),
  };
};

async function StoragePage() {
  const organization = await getOrganization();
  const organizationOwnerId = await getPrimaryOwnerId();
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`);
    return '';
  }) ?? '';
  const organizationOwner = await getUserById(organizationOwnerId ?? '');
  const newOrganization = {
    ...organization,
    owner: organizationOwner ?? null, // Add owner explicitly
  };
  const agency = await getAgencyForClient().catch((err) => {
    console.error(`Error getting agency for client: ${err}`)
    return null
  });


  return (
    <PageBody>

      <Header
        id={newOrganization.id ?? ''}
        name={newOrganization.name ?? ''}
        logo={newOrganization.picture_url ?? ''}
        owner={newOrganization.owner}
        currentUserRole={userRole}
      />
      <FilesView
        clientOrganizationId={newOrganization.id ?? ''}
        agencyId={agency?.id ?? ''}
        organizationName={organization.name ?? agency?.name ?? ''}
      />
    </PageBody>
  );
}
export default withI18n(StoragePage);
