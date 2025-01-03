import { useState, useEffect } from 'react';

import { EllipsisVertical, Trash2, ExternalLink, Check } from 'lucide-react';
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
import { generateTokenId, createToken } from '~/server/actions/tokens/tokens.action';
import { copyToClipboard } from '~/utils/clipboard';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

function DeleteOrderDropdown({orderId, orderUuid, agencyId}: {orderId: number, orderUuid?: string, agencyId?: string}) {
  const { t } = useTranslation(['orders', 'responses']);
  const [dialogType, setDialogType] = useState<'share' | 'delete' | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyToClipboard(`${baseUrl}/orders/${orderId}?public_token_id=${tokenId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  const handleCloseDialog = () => setDialogType(null);

  const router = useRouter()

  async function handleDelete() {
    try {

      const res = await deleteOrderById(orderId);
      await handleResponse(res, 'orders', t);
      handleCloseDialog();
      router.push('/orders');
      router.refresh();
    } catch (error) {
      console.error('Error deleting the order:', error);
      handleCloseDialog();
    }
  }
  async function handleGenerateTokenId() {
    if (tokenId) return;
    const generatedTokenId = await generateTokenId({id: orderUuid ?? ''}); 
    setTokenId(generatedTokenId ?? "");
    await createToken({
      id: orderUuid ?? '',
      account_id: agencyId ?? '',
      agency_id: agencyId ?? '',
      data: {
      order_id: orderId,
    }
    }, generatedTokenId) 
    return generatedTokenId;
  }

  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!tokenId) {
      void handleGenerateTokenId();
    }
  }, []);

  return (
    <div className="mb-[0.20rem] ml-2 w-auto items-center flex">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className='mr-2 h-10 m-0 text-slate-500 px-1'>
          <EllipsisVertical className="w-[20px] h-[20px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            onSelect={async (event) => {
              event.preventDefault();
              setDialogType('share');
              await handleGenerateTokenId();
            }}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <ExternalLink className="h-4 w-4" />
              <p>{t('publishProject')}</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setDialogType('delete');
            }}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <Trash2 className="h-4 w-4" />
              <p>{t('delete')}</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
        <DialogContent className={dialogType === 'share' ? 'sm:max-w-md' : ''}>
          <DialogHeader>
            <DialogTitle>
              {/* IMPORTANT: Don't change this line please. For any questions, contact with jairo.holgado@suuper.co */}
              {dialogType === 'share' ? t('shareProject') : (dialogType === 'delete' ? t('deleteConfirmation') : null)}
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'share' ? (
            <>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600">
                  🔒 {t('shareProjectDescription')}
                </p>
                <p>{t('link')}<span className="text-blue-500">*</span></p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    disabled={!tokenId}
                    value={`${baseUrl}/orders/${orderId}?public_token_id=${tokenId}`}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                <ThemedButton 
                  variant="default" 
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                  disabled={!tokenId}
                >
                  {copied ? <Check className="h-4 w-4" /> : t('copy')}
                </ThemedButton>
                </div>
              </div>
            </>
          ) : (
            dialogType === 'delete' ? (
              <DialogFooter>
            {/* IMPORTANT: Don't change this line please. For any questions, contact with jairo.holgado@suuper.co */}
              <Button variant="outline" onClick={handleCloseDialog}>
                {t('cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t('delete')}
              </Button>
            </DialogFooter>
              ) : null  
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DeleteOrderDropdown;
