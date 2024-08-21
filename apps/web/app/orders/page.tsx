import { BellIcon } from '@radix-ui/react-icons';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';



import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';



import { OrderList } from './components/orders-list';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:title'),
  };
};

// const capitalizeFirstLetter = (string: string) => {
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// };

async function UserHomePage() {
  const client = getSupabaseServerComponentClient();
  const { data: userData } = await client.auth.getUser();

  const userId = userData.user!.id;

  // Getting the role
  const { data: role, error: roleError } = await client
    .from('accounts_memberships')
    .select('account_role')
    .eq('user_id', userId)
    .single();

  if (roleError) console.error(roleError.message);
  let ordersData = [];
  const isClient =
    (role && role.account_role === 'client_owner') ||
    (role && role.account_role === 'client_member');
  if (isClient) {
    const { data: orderData, error: clientError } = await client
      .from('orders_v2')
      .select(
        '*, organization:accounts!client_organization_id(slug, name), customer:accounts!customer_id(name)',
      )
      // necessary to specify which relation to use, so tell exact the name of the foreign key
      .eq('customer_id', userId);

    ordersData = orderData ?? [];
    if (clientError) console.error(clientError.message);
  } else {
    const { data: orderData, error: ownerError } = await client
      .from('orders_v2')
      .select(
        '*, organization:accounts!client_organization_id(slug, name), customer:accounts!customer_id(name)',
      )
      .eq('propietary_organization_id', userId);

    ordersData = orderData ?? [];

    if (ownerError) console.error(ownerError.message);
  }

  const processedOrders =
    ordersData.map((order) => ({
      ...order,
      customer_organization: order.organization.name ?? '',
      customer_name: order.customer.name ?? '',
    })) ?? [];

  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
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
          <div>
            <OrderList orders={processedOrders ?? []}></OrderList>
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);