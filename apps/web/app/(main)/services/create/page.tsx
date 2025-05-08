import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import {redirect} from "next/navigation"
import MultiStepFormDemo  from './components/multiform-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function CreateServicePage() {
  const accountRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  if(accountRole !== "agency_owner" && accountRole !== "agency_project_manager"){
    return redirect("/orders")
  }
  return (
    <>
      <PageBody>
        <MultiStepFormDemo/>
      </PageBody>
    </>
  );
}

export default withI18n(CreateServicePage);
