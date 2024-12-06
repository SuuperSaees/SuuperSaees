import { redirect } from 'next/navigation';



import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import { getOrganization } from '../../../../packages/features/team-accounts/src/server/actions/organizations/get/get-organizations';
import CreateOrganization from './components/add-organization-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('organizations:title');

  return {
    title,
  };
};

export default async function UserAddOrganizationPage() {
  let organization = null;

  try {
    organization = await getOrganization();
    const organizationId = organization?.id;

    if (organizationId) {
      redirect('/orders');
    }
  } catch (error) {
    // Handle the error by redirecting to a specific page
    console.error('Error getting organization:', error);
  }
  return (
    <>
      <PageBody>
        <CreateOrganization />
      </PageBody>
    </>
  );
}