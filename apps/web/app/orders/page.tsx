import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';


import { HomeAccountsList } from '~/home/(user)/_components/home-accounts-list';
import { HomeLayoutPageHeader } from '~/home/(user)/_components/home-page-header';
import { OrderList } from './components/orders-list';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('orders:title'),
  };
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

async function UserHomePage() {
  const client = getSupabaseServerComponentClient();
  const { data: userData } = await client.auth.getUser();
  const { data: accountsData} = await client.from('accounts').select().eq('id', userData.user!.id);
  const { data: organizationData} = await client.from('accounts').select().eq('primary_owner_user_id', userData.user!.id);
  const filteredAccounts = organizationData?.filter(account => account.id !== userData.user!.id);
  const organizationIds = filteredAccounts?.map(account => account.id) || []; 
  const { data: ordersData} = await client.from('orders_v2').select().eq('propietary_organization_id', organizationIds[0] ??  '');
  const customerIds = ordersData?.map(order => order.customer_id) || [];
  const { data: clientsData } = await client.from('clients').select().in('id', customerIds);
  const clientsMap = new Map(clientsData?.map(client => [client.id, client]));

  const enrichedOrdersData = ordersData?.map(order => {
    const client = clientsMap.get(order.customer_id);
    return {
      ...order,
      customer_name: client?.name || null,
      customer_organization: client?.client_organization || null,
    };
  });

  let accountName = 'Usuario';


  if (accountsData && accountsData.length > 0) {
    const account = accountsData[0];
    if (account && 'name' in account) {
      accountName = capitalizeFirstLetter(account.name);
    } else {
      console.error('Property "name" does not exist on account object');
    }
  } else {
    console.error('No account data found or accountsData is empty');
  }


  return (
    <>
    <HomeLayoutPageHeader
        title={`Te damos la bienvenida, ${accountName || ''}`}
        description=""
      />
    <PageBody>
      <OrderList orders={enrichedOrdersData ?? []}></OrderList>
    </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
