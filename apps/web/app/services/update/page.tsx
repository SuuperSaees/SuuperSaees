import { redirect } from 'next/navigation';

import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getServiceById } from '~/team-accounts/src/server/actions/services/get/get-services';

import { MultiStepFormDemo } from '../create/components/multiform-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function UpdateServicePage({
  searchParams: { id },
}: {
  searchParams: { id: string };
}) {
  const accountRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  if (accountRole !== 'agency_owner' && accountRole !== 'agency_project_manager') {
    return redirect('/orders');
  }

  let service = await getServiceById(Number(id), true);
  const serviceBriefs = service.service_briefs.map(
    (serviceBrief) => serviceBrief.brief,
  );

  service = {
    ...service,
    briefs: serviceBriefs,
  };

  return (
    <>
      <PageBody>
        <MultiStepFormDemo previousService={service} />
      </PageBody>
    </>
  );
}

export default withI18n(UpdateServicePage);
