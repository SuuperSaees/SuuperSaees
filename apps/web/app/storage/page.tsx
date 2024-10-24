import {
  getUserById,
  getUserIdOfAgencyOwner,
  getPrimaryOwnerId
} from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getAgencyForClient } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';
import Header from '~/components/organization/header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import FilesView from './components/file-view';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('storage:title'),
  };
};

async function StoragePage() {
  const organizationId = await getUserIdOfAgencyOwner();

  const organization = await getAgencyForClient(organizationId?.account_id ?? '');

  const organizationOwnerId = await getPrimaryOwnerId();

  const organizationOwner = await getUserById(
    organizationOwnerId ?? '',
  );
  const newOrganization = { ...organization, owner: {name: organizationOwner.name, email: organizationOwner.email} };
  
  return (
    <div className='p-8 space-y-10'>
      <Header
        name={newOrganization.name ?? ''}
        logo={newOrganization.picture_url ?? ''}
        owner={newOrganization.owner}
      />
      <FilesView
         clientOrganizationId={organizationId?.account_id ?? ''} 
      />
    </div>
  );
}
export default withI18n(StoragePage);
