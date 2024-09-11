import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { redirect } from "next/navigation"
import { InvoicesTable } from './components/invoices-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('invoices:title');

  return {
    title,
  };
};

function UserHomePage() {
  return redirect("/orders")
  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                  Facturas
                </div>
              </span>
            </div>
          </div>
          <InvoicesTable invoices={[]}></InvoicesTable>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
