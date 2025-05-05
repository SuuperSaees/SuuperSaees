import { Suspense } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';
// import { PageHeader } from '../components/page-header';
// import { TimerContainer } from '../components/timer-container';
import { AgencyStatusesProvider } from './components/context/agency-statuses-context';
import { OrdersProvider } from './components/context/orders-context';
import CreateOrderButton from './components/create-order-button';
import dynamic from 'next/dynamic';
const ProjectsBoard = dynamic(() => import('./components/projects-board'), {
  ssr: false, // <- Importante para que no se incluya en SSR
});

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

async function OrdersPage() {
  const client = getSupabaseServerComponentClient({
    admin: false,
  });

  const {
    workspace: userWorkspace,
    agency,
    organization,
  } = await loadUserWorkspace();

  const agencyRoles = [
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ];

  const userAgency = agencyRoles.includes(userWorkspace.role ?? '')
    ? organization
    : agency;
  const agencyId = userAgency?.id ?? '';

  const { data, error: membersError } = await client.rpc(
    'get_account_members',
    {
      organization_slug: userAgency?.slug ?? '',
    },
  );
  const agencyStatuses = userAgency?.statuses ?? [];
  let agencyMembers = [];
  if (membersError) {
    console.error('Error fetching agency members:', membersError);
    agencyMembers = [];
  }
  agencyMembers =
    data?.map((member) => ({
      ...member,
      role: member.role.toLowerCase(),
      user_settings: {
        picture_url: member.settings?.picture_url ?? member.picture_url,
        name: member.settings?.name ?? member.name,
      },
    })) ?? [];

  const tags = userAgency?.tags ?? [];

  return (
    <OrdersProvider
      agencyMembers={agencyMembers ?? []}
      agencyId={agencyId ?? ''}
    >
      <AgencyStatusesProvider
        initialStatuses={agencyStatuses ?? []}
        agencyMembers={agencyMembers ?? []}
      >
        <PageBody className="flex h-screen max-h-full min-h-0 flex-1 flex-col">
          <PageHeader
            title="orders:title"
            rightContent={<TimerContainer />}
            className="flex w-full"
          >
            <h2 className="text-xl font-medium leading-4">
              <Trans i18nKey="orders:title" />
            </h2>
            <CreateOrderButton
              text={<Trans i18nKey="orders:create" />}
              hasOrders={true}
            />
          </PageHeader>

          <Suspense fallback={<div>Loading boar...</div>}>
            <ProjectsBoard
              agencyMembers={agencyMembers.map((member) => ({
                id: member.id,
                organization_id: member.organization_id,
                role: member.role,
                settings: member.user_settings,
              }))}
              tags={tags}
            />
          </Suspense>
        </PageBody>
      </AgencyStatusesProvider>
    </OrdersProvider>
  );
}

export default withI18n(OrdersPage);
