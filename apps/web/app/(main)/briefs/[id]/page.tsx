
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
  params
}: {
    params: {
        id: string;
    };
}) {


  const id = params.id;
  const brief = await getBriefById(id)
  const formattedBrief = {
    ...brief,
    formFields: brief.brief_form_fields.map((item) => item.field).filter((field) => field !== null),
  }
  // Get the form fields associated with the brief and the brief information

  return (
    <PageBody className="mx-auto flex w-full max-w-7xl p-8 lg:px-16">
      <PageHeader
        title="briefs:update.title"
        className="w-full"
      />


      <BriefCreationForm
        defaultFormFields={formattedBrief.formFields}
        defaultBriefInfo={formattedBrief}
      />
    </PageBody>
  );
}

export default withI18n(UpdateBriefsPage);
