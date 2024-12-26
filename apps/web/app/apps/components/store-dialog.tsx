import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader
} from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';

import { Layers2 } from 'lucide-react';

import PluginCard from './plugin-card';
import { Card } from '@kit/ui/card';

interface StoreDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function StoreDialog({ isOpen, setIsOpen }: StoreDialogProps) {
  const { t } = useTranslation('plugins');
  const providers = ['loom', 'treli', 'stripe'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90vw] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] 2xl:max-w-[60%]">
        <DialogHeader>
          <div className='flex flex-row items-center gap-3'>
            <Card className='p-3 rounded-lg'>
              <Layers2 className='h-6 w-6' strokeWidth={1.5} />
            </Card>
            <p className='font-bold text-lg my-0'>{t('recommendedAppsForYou')}</p>
          </div>
        </DialogHeader>
        <Separator className="my-2" />
        <div className="grid grid-cols-2 gap-4">
          {providers.map((provider, index) => (
            <PluginCard key={index} provider={provider} mode="install" />
          ))}
        </div>
        <Separator className="my-2" />
        <DialogFooter>
          <div className='w-full'>
            <p className='text-gray-600 text-sm'>{t('getRecommendations')}</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StoreDialog;
