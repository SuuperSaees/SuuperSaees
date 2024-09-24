import { getUserById } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import {
  getOrganization,
  getOrganizationSettings,
} from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';

import OrganizationSection from '~/components/organization/organization';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('organization:title'),
  };
};

async function OrganizationsPage() {
  const organization = await getOrganization();
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

  return (
    <OrganizationSection
      name={newOrganization.name}
      logo={newOrganization.picture_url}
      owner={newOrganization.owner}
      clientOrganizationId={newOrganization.id}
    />
  );
}

export default withI18n(OrganizationsPage);
