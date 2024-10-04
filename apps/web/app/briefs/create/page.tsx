import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import BriefCreationForm from '../components/brief-creation-form';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Database } from '~/lib/database.types';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('briefs:creation.title'),
  };
};

async function CreateBriefsPage() {
  const client = getSupabaseServerComponentClient<Database>();
  const { data: userData } = await client.auth.getUser();

  const propietary_organization_id = userData.user!.id;

  return (
    <PageBody className="mx-auto flex w-full max-w-7xl p-8">
      <div className="mb-[32px] flex w-full items-center justify-between">
        <h2
          className={
            'font-inter text-[30px] font-semibold leading-8 text-gray-900'
          }
        >
          <Trans i18nKey={'briefs:creation.title'} />
        </h2>
      </div>

      <BriefCreationForm propietary_organization_id={propietary_organization_id}/>
    </PageBody>
  );
}

export default withI18n(CreateBriefsPage);