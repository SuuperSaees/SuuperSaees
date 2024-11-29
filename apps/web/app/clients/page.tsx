import { getAllClients } from 'node_modules/@kit/team-accounts/src/server/actions/clients/get/get-clients';

import { ClientsTable } from '@kit/team-accounts/components';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getUserRole } from '~/team-accounts/src/server/actions/members/get/get-member-account';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('clients:title'),
  };
};

async function ClientsMembersPage() {
  const clientsWithOrganizations = await getAllClients();
  const userRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  return (
    <PageBody>
      <div className="p-[35px]">
        <div className="mb-[36px] flex items-center justify-between">
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
          userRole={userRole}
          // accountIds={accountIds}
          // accountNames={accountNames}
        />
      </div>
    </PageBody>
  );
}

export default withI18n(ClientsMembersPage);