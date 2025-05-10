import { useState } from 'react';

import { MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteOrderById } from '~/team-accounts/src/server/actions/orders/delete/delete-order';

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
import { handleResponse } from '~/lib/response/handle-response';
import { copyToClipboard } from '~/utils/clipboard';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

function DeleteOrderDropdown({orderId, isPublic, tokenId}: {orderId: number, isPublic: boolean, tokenId?: string}) {
  const { t } = useTranslation(['orders', 'responses']);
  const baseUrl = window.location.origin;
  const handleCopy = async () => {
    await copyToClipboard(`${baseUrl}/orders/${orderId}?public_token_id=${tokenId}`);
    toast.success(t('success.copyToClipboard'));
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter()

  const handleCloseDialog = () => setShowDeleteDialog(false);
  const queryClient = useQueryClient();
  async function handleDelete() {
    try {
      const res = await deleteOrderById(orderId);
      await handleResponse(res, 'orders', t);
      handleCloseDialog();
      router.push('/orders');
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.refresh();
    } catch (error) {
      console.error('Error deleting the order:', error);
      handleCloseDialog();
    }
  }

  return (
    <div className="mb-[0.20rem] ml-2 w-auto items-start flex">
      <DropdownMenu>
        <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 mr-2 h-10 m-0 p-0 hover:text-gray-700 text-gray-400 bg-transparent " />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isPublic && (
            <DropdownMenuItem
              disabled={!tokenId}
              onSelect={async (event) => {
                event.preventDefault();
                await handleCopy();
              }}
            >
              <div className="flex items-center gap-2 text-gray-800">
                <ExternalLink className="h-4 w-4" />
                <p>{t('publishProject')}</p>
              </div>
            </DropdownMenuItem>
          )}
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setShowDeleteDialog(true);
              }}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <Trash2 className="h-4 w-4" />
              <p>{t('delete')}</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmation')}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
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
