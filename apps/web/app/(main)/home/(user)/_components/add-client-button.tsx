import { useState } from 'react';

import { Plus } from 'lucide-react';

import CreateClientDialog from '~/team-accounts/src/server/actions/clients/create/create-client';

export function AddClientButton() {
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] =
    useState(false);

  return (
    <>
      <button
        className="flex items-center gap-2 w-4 h-4"
        onClick={() => setIsCreateClientDialogOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </button>
      <CreateClientDialog
        open={isCreateClientDialogOpen}
        onOpenChange={setIsCreateClientDialogOpen}
        customTrigger={<div className="hidden" />}
      />
    </>
  );
}
