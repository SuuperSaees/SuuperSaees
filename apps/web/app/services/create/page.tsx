import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import MultiStepFormDemo from './components/multiform-component';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

function CreateServicePage() {
  return (
    <>
    <PageBody>
        <div className='p-[35px]'>
            <MultiStepFormDemo />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(CreateServicePage);
