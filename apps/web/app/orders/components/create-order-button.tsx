import Link from 'next/link';

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
        <Link href="/orders/create">
          <ThemedButton className="h-fit">{t('creation.title')}</ThemedButton>
        </Link>
      )}
    </>
  );
};

export default CreateOrderButton;
