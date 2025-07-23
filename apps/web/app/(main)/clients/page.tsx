// import { getAllClients } from 'node_modules/@kit/team-accounts/src/server/actions/clients/get/get-clients';

import { ClientsTable } from '@kit/team-accounts/components';
import { PageBody } from '@kit/ui/page';

import { Client } from '~/lib/client.types';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { Organization } from '~/lib/organization.types';
import { Pagination } from '~/lib/pagination';
import {
  getClients,
  getOrganizations,
} from '~/server/actions/clients/get-clients';

import { PageHeader } from '../../components/page-header';
import { loadUserWorkspace } from '../home/(user)/_lib/server/load-user-workspace';
import CreateClientDialog from '~/team-accounts/src/server/actions/clients/create/create-client';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('clients:title'),
  };
};

async function ClientsMembersPage() {
  // const clientsWithOrganizations = await getAllClients().catch((err) => {
  //   console.error(`Error getting clients with organizations: ${err}`);
  //   return [];
  // });

  const workspace = await loadUserWorkspace();
  const agencyId = (workspace?.workspace.role ?? '').startsWith('agency_')
    ? workspace.organization.id
    : workspace.agency?.id;


  const clients = (await getClients(agencyId ?? '', {
    pagination: {
      page: 1,
      limit: 100,
    },
  })) as Pagination.Response<Client.Response>;

  const organizations = (await getOrganizations(agencyId ?? '', {
    pagination: {
      page: 1,
      limit: 100,
    },
  })) as Pagination.Response<Organization.Response>;

  return (
    <PageBody>
      <PageHeader title="clients:client" rightContent={<CreateClientDialog />} />
      <ClientsTable
        initialClients={clients ?? []}
        initialOrganizations={organizations ?? []}
        agencyId={agencyId ?? ''}
        // accountIds={accountIds}
        // accountNames={accountNames}
      />
    </PageBody>
  );
}

export default withI18n(ClientsMembersPage);
