import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import {
  getOrganizationById,
  getOrganizationSettings,
} from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import Header from '~/components/organization/header';
import SectionView from '~/components/organization/section-view';
// import OrganizationSection from '~/components/organization/organization';
// import { PageBody } from '@kit/ui/page';
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
  const organizationSettings = await getOrganizationSettings();
  const organizationImage =
    organizationSettings.find((setting) => setting.key === 'logo_url')?.value ??
    '';
  const organizationOwner = await getUserById(
    organization?.primary_owner_user_id,
  );
  let newOrganization = { ...organization };
  newOrganization.picture_url = organizationImage;
  newOrganization.owner = organizationOwner ?? null;

  console.log('organization', newOrganization);
  return (
    <div className="flex flex-col gap-8 p-8">
      <Header
        name={newOrganization.name}
        logo={newOrganization.picture_url}
        owner={newOrganization.owner}
      />
      <SectionView clientOrganizationId={params.id} />
    </div>
  );
}
export default withI18n(OrganizationsPage);