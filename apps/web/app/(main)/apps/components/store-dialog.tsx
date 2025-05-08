import { Layers2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';

import PluginCard from './plugin-card';

interface Plugin {
  pluginId?: string;
  id: string;
  name: string;
  status: 'installed' | 'uninstalled' | 'failed' | 'in progress';
  icon_url?: string | null;
}

interface StoreDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  plugins: Plugin[];
}

function StoreDialog({ isOpen, setIsOpen, plugins }: StoreDialogProps) {
  const { t } = useTranslation('plugins');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90vw] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[65%] 2xl:max-w-[60%]">
        <DialogHeader>
          <div className="flex flex-row items-center gap-3">
            <Card className="rounded-lg p-3">
              <Layers2 className="h-6 w-6" strokeWidth={1.5} />
            </Card>
            <p className="my-0 text-lg font-bold">
              {t('recommendedAppsForYou')}
            </p>
          </div>
        </DialogHeader>
        <Separator className="my-2" />
        <div className="grid grid-cols-2 gap-4">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              pluginId={plugin.pluginId}
              name={plugin.name}
              status={plugin.status}
              mode="install"
              id={plugin.id}
              icon_url={plugin.icon_url}
            />
          ))}
        </div>
        <Separator className="my-2" />
        <DialogFooter>
          <div className="w-full">
            <p className="text-sm text-gray-600">{t('getRecommendations')}</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StoreDialog;
