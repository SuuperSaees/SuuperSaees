import { getOrders } from 'node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order';
import { getAgencyStatuses } from 'node_modules/@kit/team-accounts/src/server/actions/statuses/get/get-agency-statuses';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getOrganizationById } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

import { PageHeader } from '../components/page-header';
import { TimerContainer } from '../components/timer-container';
import { AgencyStatusesProvider } from './components/context/agency-statuses-context';
import { OrderList } from './components/orders-list';

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
  const ordersData = await getOrders(true).catch((err) => console.error(err));
  const agencyId = ordersData?.[0]?.agency_id;

  const agencyStatuses = await getAgencyStatuses(agencyId ?? '')
    .catch((err) => console.error(err))
    .catch(() => []);

  const agency = await getOrganizationById(agencyId ?? '').catch((err) => console.error(`Error fetching agency: ${err}`));  

  const { data, error: membersError } = await client.rpc('get_account_members', {
    account_slug: agency?.slug ?? '',
  })
  let agencyMembers = [];
  if (membersError) {
    console.error('Error fetching agency members:', membersError);
    agencyMembers = [];
  }
  agencyMembers = data?.map((member) => ({
    ...member,
    role: member.role.toLowerCase(),
    user_settings:  {
      picture_url: member.picture_url,
      name: member.name,
    }
  })) ?? [];

  
  return (
    <>
      <AgencyStatusesProvider initialStatuses={agencyStatuses ?? []}>
        <PageBody>
          <div className="p-[35px]">
            <PageHeader
              title="orders:title"
              rightContent={<TimerContainer />}
            />

            <OrderList
              orders={ordersData ?? []}
              agencyMembers={agencyMembers ?? []}
              agencyStatuses={agencyStatuses ?? []}
            ></OrderList>
          </div>
        </PageBody>
      </AgencyStatusesProvider>
    </>
  );
}

export default withI18n(OrdersPage);
