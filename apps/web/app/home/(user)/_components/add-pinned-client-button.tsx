'use client';

import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { PinClientsDialog } from './pin-clients-dialog';

export function AddPinnedClientButton() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button 
        className="flex items-center px-4 bg-transparent border-none gap-2 opacity-70 hover:opacity-100"
        onClick={() => setIsDialogOpen(true)}
      >
        <Star className="h-4 w-4" />
        <span className="text-sm font-medium">{t('sidebar.pinClient')}</span>
      </button>
      <PinClientsDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
}
