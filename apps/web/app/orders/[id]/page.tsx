import { PageBody } from '@kit/ui/page';

import UploadFileComponent from '~/components/ui/files-input';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import AsideOrderInformation from './components/aside-order-information';
import Interactions from './components/interactions';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('orders:details.title'),
  };
};
const mockedOrder = {
  id: 2002,
  title: 'Pedido 29 - Diseño volantes QR',
  description: 'This is the order details page',
  status: 'in_progress',
  priority: 'high',
  due_date: '2024-08-15',
  created_at: '2024-08-13',
  assigned_to: [
    {
      name: 'Johna Doe',
      email: 'john@example.com',
      picture_url:
        'https://images.pexels.com/photos/5611966/pexels-photo-5611966.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      picture_url:
        'https://images.pexels.com/photos/5333016/pexels-photo-5333016.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
    },
    {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      picture_url:
        'https://images.pexels.com/photos/3290710/pexels-photo-3290710.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      name: 'Alice Williams',
      email: 'alice@example.com',
      picture_url:
        'https://images.pexels.com/photos/4550985/pexels-photo-4550985.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      name: 'Tom Davis',
      email: 'tom@example.com',
      picture_url:
        'https://images.pexels.com/photos/6507483/pexels-photo-6507483.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ],
  client: {
    name: 'Fredd',
    email: 'freed@example.com',
    picture_url:
      'https://images.pexels.com/photos/4764224/pexels-photo-4764224.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
};

function OrderDetailsPage() {
  const orderDetail = mockedOrder;
  return (
    <PageBody className="lg:px-0">
      <div className="flex w-full flex-col text-gray-700">
        <div className="flex w-full gap-6">
          <div className="flex w-full min-w-0 max-w-full flex-col gap-2">
            <Interactions />
            <UploadFileComponent bucketName="orders" />
          </div>
          <AsideOrderInformation order={orderDetail} />
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(OrderDetailsPage);
