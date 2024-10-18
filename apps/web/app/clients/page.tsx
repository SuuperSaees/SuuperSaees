import { getAllClients } from 'node_modules/@kit/team-accounts/src/server/actions/clients/get/get-clients';

import { ClientsTable } from '@kit/team-accounts/components';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('clients:title'),
  };
};

async function ClientsMembersPage() {
  const clientsWithOrganizations = await getAllClients();

  return (
    <PageBody>
      <div className="p-[35px]">
        <div className="mb-[32px] flex items-center justify-between">
          <div className="flex-grow">
            <span>
              <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
                <Trans i18nKey={'clients:client'} />
              </div>
            </span>
          </div>
        </div>
        <ClientsTable
          clients={clientsWithOrganizations ?? []}
          // accountIds={accountIds}
          // accountNames={accountNames}
        />
      </div>
    </PageBody>
  );
}

export default withI18n(ClientsMembersPage);