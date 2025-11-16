import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getBriefById } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

import BriefCreationForm from '../components/brief-creation-form';
import { PageHeader } from '../../../components/page-header';

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
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`);
    return '';
  });

  const brief = await getBriefById(id)
  const formattedBrief = {
    ...brief,
    formFields: brief.brief_form_fields.map((item) => item.field).filter((field) => field !== null),
  }
  // Get the form fields associated with the brief and the brief information

  return (
    <PageBody className="mx-auto flex w-full max-w-7xl p-8 lg:px-16">
      <div className="mb-[32px] flex w-full items-center justify-between">
        <PageHeader title={'briefs:update.title'} />
      </div>

      <BriefCreationForm
        userRole={userRole}
        defaultFormFields={formattedBrief.formFields}
        defaultBriefInfo={formattedBrief}
      />
    </PageBody>
  );
}

export default withI18n(UpdateBriefsPage);
