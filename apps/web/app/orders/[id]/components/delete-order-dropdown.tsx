import { useState } from 'react';

import { EllipsisVertical, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteOrderById } from '~/team-accounts/src/server/actions/orders/delete/delete-order';
import {toast} from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

function DeleteOrderDropdown({orderId}: {orderId: number}) {
  const { t } = useTranslation('orders');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter()

  async function handleDelete() {
    try {
      await deleteOrderById(orderId);
      setIsDialogOpen(false);
      router.push('/orders');
      router.refresh();
      toast.success(t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting the order:', error);
      setIsDialogOpen(false);
      toast.success(t('deleteError'));
    }
  }

  return (
    <div className="mb-[0.20rem] ml-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setIsDialogOpen(true);
            }}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <Trash2 className="h-4 w-4" />
              <p>{t('delete')}</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmation')}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DeleteOrderDropdown;
