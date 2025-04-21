import { getAllClients } from 'node_modules/@kit/team-accounts/src/server/actions/clients/get/get-clients';

import { ClientsTable } from '@kit/team-accounts/components';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('clients:title'),
  };
};

async function ClientsMembersPage() {
  const clientsWithOrganizations = await getAllClients().catch((err) => {
    console.error(`Error getting clients with organizations: ${err}`)
    return []
  });

  return (
    <PageBody>
      <div className="p-[35px]">
        <PageHeader
            title="clients:client" 
            rightContent={
              <TimerContainer /> 
            }
        />
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