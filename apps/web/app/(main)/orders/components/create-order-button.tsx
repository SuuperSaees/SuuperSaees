
import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import PrefetcherLink from '../../../components/shared/prefetcher-link';
import { cn } from '@kit/ui/utils';

const CreateOrderButton = ({
  t,
  hasOrders,
  className,
}: {
  t: (key: string) => string;
  hasOrders: boolean;
  className?: string;
}) => {
  return (
    <>
      {hasOrders && (
        <PrefetcherLink href="/orders/create" className={cn(className)}>
          <ThemedButton className="h-fit" aria-label={t('orders:create')}>
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t('orders:create')}
            </span>
          </ThemedButton>
        </PrefetcherLink>
      )}
    </>
  );
};

export default CreateOrderButton;
