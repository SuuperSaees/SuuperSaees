import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import BriefCreationForm from '../components/brief-creation-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('briefs:creation.title'),
  };
};

async function CreateBriefsPage() {
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });

  return (
    <PageBody className="mx-auto flex w-full max-w-7xl lg:px-16 p-8">
      <div className="mb-[32px] flex w-full items-center justify-between">
        <h2
          className={
            'font-inter text-[30px] font-semibold leading-8 text-gray-900'
          }
        >
          <Trans i18nKey={'briefs:creation.title'} />
        </h2>
      </div>

      <BriefCreationForm
        userRole={userRole}
      />
    </PageBody>
  );
}

export default withI18n(CreateBriefsPage);
