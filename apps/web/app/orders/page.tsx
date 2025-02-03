import { getAgencyStatuses } from 'node_modules/@kit/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getTags } from '~/server/actions/tags/tags.action';
import { getOrders } from '~/team-accounts/src/server/actions/orders/get/get-order';
import {
  getAgencyForClient,
  getOrganization,
} from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';
import { AgencyStatusesProvider } from './components/context/agency-statuses-context';
import { OrdersProvider } from './components/context/orders-context';
import ProjectsBoard from './components/projects-board';

// type OrderResponse = Omit<Order.Response, 'id'> & {
//   id: string;
// };
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
  // const ordersData = ((await getOrders(true).catch((err) => {
  //   console.error(err);
  //   return [];
  // })) ?? []) as OrderResponse[];
  // const agencyId = ordersData?.[0]?.agency_id;
  const { workspace: userWorkspace } = await loadUserWorkspace();
  const userOrganization = await getOrganization();
  const agencyRoles = [
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ];

  const agency = agencyRoles.includes(userWorkspace.role ?? '')
    ? userOrganization
    : await getAgencyForClient(userOrganization.id ?? '');
  const agencyId = agency?.id ?? '';
  const agencyStatuses =
    (await getAgencyStatuses(agencyId ?? '').catch(() => [])) ?? [];

  // const agency = await getOrganizationById(agencyId ?? '').catch((err) =>
  //   console.error(`Error fetching agency: ${err}`),
  // );

  const { data, error: membersError } = await client.rpc(
    'get_account_members',
    {
      account_slug: agency?.slug ?? '',
    },
  );
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
        picture_url: member.picture_url,
        name: member.name,
      },
    })) ?? [];

  const tags = await getTags(agencyId ?? '');

  return (
    <OrdersProvider
      agencyMembers={agencyMembers ?? []}
      agencyId={agencyId ?? ''}
      queryKey={['orders']}
      queryFn={() => getOrders(true)}
    >
      <AgencyStatusesProvider
        initialStatuses={agencyStatuses ?? []}
        agencyMembers={agencyMembers ?? []}
      >
        <PageBody className="h-screen">
          <div className="flex h-full max-h-full min-h-0 flex-1 flex-col p-[35px]">
            <PageHeader
              title="orders:title"
              rightContent={<TimerContainer />}
            />

            <ProjectsBoard agencyMembers={agencyMembers} tags={tags} />
          </div>
        </PageBody>
      </AgencyStatusesProvider>
    </OrdersProvider>
  );
}

export default withI18n(OrdersPage);
