import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';

import { loadUserWorkspace } from '../home/(user)/_lib/server/load-user-workspace';
// import { PageHeader } from '../components/page-header';
// import { TimerContainer } from '../components/timer-container';
import { AgencyStatusesProvider } from './components/context/agency-statuses-context';
import { OrdersProvider } from './components/context/orders-context';
import ProjectsBoard from './components/projects-board';
import CreateOrderButton from './components/create-order-button';
import { PageHeader } from '~/(main)/../components/page-header';

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
      name: member.settings?.name ?? member.name,
      picture_url: member.settings?.picture_url ?? member.picture_url,
    })) ?? [];

  const target = agencyRoles.includes(userWorkspace.role ?? '')
    ? 'agency'
    : 'client';

  const orders = await getOrders(organization.id ?? '', target, true, {
    pagination: {
      page: 1,
      limit: 100,
    },
  });
  const tags = userAgency?.tags ?? [];
  
  return (
    <OrdersProvider
      initialOrders={orders}
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
              rightContent={<CreateOrderButton />}
            />

          <ProjectsBoard
            agencyMembers={agencyMembers.map((member) => ({
              id: member.id,
              organization_id: member.organization_id,
              role: member.role,
              name: member.name,
              picture_url: member.picture_url,
            }))}
            tags={tags}
          />
          {/* {
              agencyRoles.includes(userWorkspace.role ?? '') ? (
                <ProjectsBoard agencyMembers={agencyMembers.map(member => ({
                  organization_id: member.account_id,
                  settings: member.user_settings,
                  role: member.role
                }))} tags={tags} />
              ) : (
                <SectionView 
                  clientOrganizationId={userOrganization.id ?? ''} 
                  currentUserRole={userWorkspace.role ?? ''} 
                  agencyId={agencyId ?? ''} 
                  sections={['orders']}
                  showCardStats={false}
                />
              )
            } */}
        </PageBody>
      </AgencyStatusesProvider>
    </OrdersProvider>
  );
}

export default withI18n(OrdersPage);
