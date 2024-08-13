import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { HomeLayoutPageHeader } from '~/home/(user)/_components/home-page-header';
import { OrderList } from './components/orders-list';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { BellIcon } from '@radix-ui/react-icons';



export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('orders:title');
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
      customer_name: client?.name,
      customer_organization: client?.client_organization,
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
    <PageBody>
    <div className='p-[35px]'>
      <div className="flex justify-between items-center mb-[32px]">
                  <div className="flex-grow">
                      <span>
                      <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                        Pedidos
                      </div>
                      </span>
                  </div>
                  <div className="flex space-x-4">
                      <span>
                          <Button variant="outline">
                              Tu prueba gratuita termina en xx dias
                          </Button>
                      </span>
                      <span>
                          <Button variant="outline" size="icon">
                              <BellIcon className="h-4 w-4" />
                          </Button>
                      </span>
                  </div>
              </div>
            
        <OrderList orders={enrichedOrdersData ?? []}></OrderList>
      </div>
    </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
