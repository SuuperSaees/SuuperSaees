import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { Brief } from '~/lib/brief.types';
import { Database } from '~/lib/database.types';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getBriefsById } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

import BriefCreationForm from '../components/brief-creation-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('briefs:update.title'),
  };
};

async function UpdateBriefsPage({
  searchParams: { id },
}: {
  searchParams: {
    id: string;
  };
}) {
  const client = getSupabaseServerComponentClient<Database>();
  const { data: userData } = await client.auth.getUser();

  const propietary_organization_id = userData.user!.id;
  const userRole = await getUserRole();
  const briefId = id;

  // Get the form fields associated with the brief and the brief information
  const briefRelevantInfo = (await getBriefsById(briefId)).map(info => ({
    id: info.id,
    created_at: info.created_at,
    name: info.name,
    propietary_organization_id: info.propietary_organization_id,
    description: info.description,
    image_url: info.image_url,
    brief_form_fields: info.brief_form_fields,
    services: info.services,
  }));

  const briefRelevantInfoFiltered = ( briefRelevantInfo.map(info => ({
    id: info.id,
    created_at: info.created_at,
    name: info.name,
    propietary_organization_id: info.propietary_organization_id,
    description: info.description,
    image_url: info.image_url,
    services: info.services,
  })));


  const briefFormFields = briefRelevantInfo.map(info => info.brief_form_fields).flat();
  const formFields = briefFormFields
    .map((item) => item.field)
    .filter((field) => field !== null);
  
  return (
    <PageBody className="mx-auto flex w-full max-w-7xl p-8 lg:px-16">
      <div className="mb-[32px] flex w-full items-center justify-between">
        <h2
          className={
            'font-inter text-[30px] font-semibold leading-8 text-gray-900'
          }
        >
          <Trans i18nKey={'briefs:update.title'} />
        </h2>
      </div>

      <BriefCreationForm
        propietaryOrganizationId={propietary_organization_id}
        userRole={userRole}
        defaultValues={formFields as Brief.Relationships.FormField[]}
        defaultBriefInfo={briefRelevantInfoFiltered[0]}
      />
    </PageBody>
  );
}

export default withI18n(UpdateBriefsPage);
