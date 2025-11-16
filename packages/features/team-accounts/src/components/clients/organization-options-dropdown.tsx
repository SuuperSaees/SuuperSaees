'use client';

import { Plus, MoreVertical, Star, StarOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';

import { Spinner } from '@kit/ui/spinner';
import Dropdown, { DropdownOption } from '../../../../../../apps/web/components/ui/dropdown';
import { useOrganizationSettings } from '../../../../accounts/src/context/organization-settings-context';
import Link from 'next/link';
import DeleteUserDialog from '../../server/actions/clients/delete/delete-client';

interface OrganizationOptionsDropdownProps {
  organizationId: string;
  queryKey?: string;
}

export function OrganizationOptionsDropdown({
  organizationId,
  queryKey,
}: OrganizationOptionsDropdownProps) {
  const { t } = useTranslation(['clients']);
  const { updateOrganizationSetting, pinned_organizations } = useOrganizationSettings();

  // Check if organization is pinned
  const isPinned = () => {
    if (!pinned_organizations) return false;
    const pinnedOrgs: string[] = JSON.parse(pinned_organizations);
    return pinnedOrgs.includes(organizationId);
  };

  // Pin/Unpin mutation
  const togglePinMutation = useMutation({
    mutationFn: async () => {
      const pinnedOrganizations: string[] = pinned_organizations
        ? JSON.parse(pinned_organizations)
        : [];
      
      const newPinnedOrgs = isPinned()
        ? pinnedOrganizations.filter((id: string) => id !== organizationId)
        : [...pinnedOrganizations, organizationId];

      await updateOrganizationSetting.mutateAsync({
        key: 'pinned_organizations',
        value: JSON.stringify(newPinnedOrgs),
      });
    },
  });

  // Dropdown options
  const dropdownOptions: DropdownOption[] = [
    // Pin/Unpin organization
    {
      value: (
        <button
          onClick={() => togglePinMutation.mutate()}
          className="flex w-full items-center gap-2"
        >
          {togglePinMutation.isPending ? (
            <Spinner className="h-4 w-4 text-gray-500" />
          ) : isPinned() ? (
            <StarOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Star className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-700">
            {isPinned() ? t('organizations.unpinOrganization') : t('organizations.pinOrganization')}
          </span>
        </button>
      ),
      actionFn: () => {
        // Button handles the action
        null;
      },
    },
    // Add space
    {
      value: (
        <Link
          href={`/embeds?accountId=${organizationId}&action=create`}
          className="flex w-full items-center gap-2"
        >
          <Plus className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {t('sidebar.addSpace')}
          </span>
        </Link>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Delete organization
    {
      value: (
        <DeleteUserDialog userId={''} organizationId={organizationId} withText queryKey={queryKey}/>
      ),
      actionFn: () => {
        // Dialog handles the action
        null;
      },
    },
  ];

  return (
    <Dropdown
      options={dropdownOptions}
      showSeparators={false}
      contentClassName="w-56 p-2 cursor-pointer"
    >
      <button
        className="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Organization options"
        type="button"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
    </Dropdown>
  );
} 