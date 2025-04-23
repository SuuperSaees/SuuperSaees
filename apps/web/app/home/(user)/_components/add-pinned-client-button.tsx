'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { PinClientsDialog } from './pin-clients-dialog';

export function AddPinnedClientButton() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button 
        className="flex items-center px-3 py-2 bg-transparent border-none gap-2 opacity-70 hover:opacity-100"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="h-4 w-4" />
        <span className="text-xs font-semibold">{t('sidebar.pinClient')}</span>
      </button>
      <PinClientsDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
}
