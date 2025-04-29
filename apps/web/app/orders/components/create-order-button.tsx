import Link from 'next/link';

import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

const CreateOrderButton = ({
  t,
  hasOrders,
}: {
  t: (key: string) => string;
  hasOrders: boolean;
}) => {
  return (
    <>
      {hasOrders && (
        <Link href="/orders/create" className='ml-auto'>
          <ThemedButton className="h-fit">
            <PlusIcon className="h-4 w-4" />
            {t('orders:create')}
          </ThemedButton>
        </Link>
      )}
    </>
  );
};

export default CreateOrderButton;
