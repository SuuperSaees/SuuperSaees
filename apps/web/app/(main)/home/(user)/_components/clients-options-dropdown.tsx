'use client';

import { useState } from 'react';

import { MoreHorizontal, Pin, Plus } from 'lucide-react';

import Dropdown, { DropdownOption } from '~/components/ui/dropdown';
import CreateClientDialog from '~/team-accounts/src/server/actions/clients/create/create-client';

import { PinClientsDialog } from './pin-clients-dialog';
import { useTranslation } from 'react-i18next';

export function ClientsOptionsDropdown() {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] =
    useState(false);

  const { t } = useTranslation('common');
  // Create a ref to the hidden CreateClientDialog trigger

  // Dropdown options
  const dropdownOptions: DropdownOption[] = [
    {
      value: (
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.addClient')}
          </span>
        </div>
      ),
      actionFn: () => {
        setIsCreateClientDialogOpen(true);
      },
      // Close the dropdown after clicking
    },
    {
      value: (
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.pinClient')}
          </span>
        </div>
      ),
      actionFn: () => {
        setIsPinDialogOpen(true);
      },
      // Close the dropdown after clicking
    },
  ];

  return (
    <>
      {/* Pin Clients Dialog - Now as a separate component */}
      <PinClientsDialog
        open={isPinDialogOpen}
        onOpenChange={setIsPinDialogOpen}
      />

      {/* Add Client Dialog - Using the existing CreateClientDialog component */}
      <CreateClientDialog
        open={isCreateClientDialogOpen}
        onOpenChange={setIsCreateClientDialogOpen}
        customTrigger={<div className='hidden'/>}
        // customTrigger={
        //   <button
        //     type="button"
        //     className="hidden" // Hide the button as we'll trigger it programmatically
        //   />
        // }
      />
      {/* Client Options Dropdown */}
      <Dropdown
        options={dropdownOptions}
        showSeparators={false}
        contentClassName="w-56 p-2 cursor-pointer"
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent cursor-pointer"
          aria-label="Client options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </div>
      </Dropdown>
    </>
  );
}
