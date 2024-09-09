import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import CreateOrganization from './components/add-organization-form';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('organizations:title');
<<<<<<< Updated upstream

=======
  
>>>>>>> Stashed changes
  return {
    title,
  };
};

export default async function UserAddOrganizationPage() {
  const {organization_id} = await getOrganization()
  if (organization_id) {
    redirect("/orders")
  }
  return (
    <>
      <PageBody className={''}>
        <CreateOrganization />
      </PageBody>
    </>
  );
}



