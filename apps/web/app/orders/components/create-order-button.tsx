
import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import PrefetcherLink from '../../components/shared/prefetcher-link';

const CreateOrderButton = ({
  text,
  hasOrders,
}: {
  text: string | React.ReactNode;
  hasOrders: boolean;
}) => {
  return (
    <>
      {hasOrders && (
        <PrefetcherLink href="/orders/create" className='ml-auto'>
          <ThemedButton className="h-fit">
            <PlusIcon className="h-4 w-4" />
            {text}
          </ThemedButton>
        </PrefetcherLink>
      )}
    </>
  );
};

export default CreateOrderButton;
