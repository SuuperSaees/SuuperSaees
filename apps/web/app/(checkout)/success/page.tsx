import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import DetailsSide from './components/success-info';
import { Trans } from '@kit/ui/trans';
import { CheckCircle } from 'lucide-react';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:checkout:successTitle');

  return {
    title,
  };
};

function PaymentSuccess({
  searchParams: { accountAlreadyExists, type },
}: {
  searchParams: { accountAlreadyExists: string; type: string };
}) {
  const accountAlreadyExistsBool = accountAlreadyExists === 'true';
  const isInvoice = type === 'invoice';
  return (
    <PageBody className="flex h-screen items-center justify-center">
      <main className="m-10 mx-auto max-w-6xl rounded-md text-center border bg-white">
        <div className="mb-10 flex flex-col gap-4 p-4">
          <h1 className=" text-4xl font-extrabold">
            <Trans i18nKey="services:checkout:success:title"  />
          </h1>
          
          <h2 className="text-2xl">
            <Trans i18nKey="services:checkout:success:description"  />
          </h2>
          <div>
            <CheckCircle size={64} className="text-green-500 mx-auto" />
          </div>
          {accountAlreadyExistsBool && !isInvoice && (
            <p className="mt-4">
              <Trans i18nKey="services:checkout:success:already_account"  />
            </p>
          )}
          {!accountAlreadyExistsBool && !isInvoice && (
            <p className="mt-4">
              <Trans i18nKey="services:checkout:success:not_account"  />
            </p>
          )}
          <DetailsSide />
        </div>
      </main>
    </PageBody>
  );
}

export default withI18n(PaymentSuccess);
