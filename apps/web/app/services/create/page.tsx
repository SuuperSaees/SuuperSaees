import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { Button } from '@kit/ui/button';
import { BellIcon } from 'lucide-react';
import { Trans } from '@kit/ui/trans';
import MultiStepFormDemo from './components/multiform-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function CreateServicePage() {
  

  return (
    <>
    <PageBody>
        <div className='p-[35px]'>
            {/* <div className="flex justify-between items-center mb-[32px]">
                <div className="flex-grow">
                    <span>
                    <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                      <Trans i18nKey="services:serviceTitle" />
                    </div>
                    </span>
                </div>
                <div className="flex space-x-4">
                    <span>
                        <Button variant="outline">
                            Tu prueba gratuita termina en xx dias
                        </Button>
                    </span>
                    <span>
                        <Button variant="outline" size="icon">
                            <BellIcon className="h-4 w-4" />
                        </Button>
                    </span>
                </div>
            </div> */}
            <MultiStepFormDemo />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(CreateServicePage);
