'use client';

import { useState } from 'react';

import Link from 'next/link';

import { useMutation } from '@tanstack/react-query';
import {
  Archive,
  Briefcase,
  Layers,
  MoreHorizontal,
  Plus,
  StarOff,
  UserPlus,
  Users,
} from 'lucide-react';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@kit/ui/spinner';

import { InviteClientMembersDialogContainer } from '~/components/organization/invite-client-members-dialog';
import Dropdown, { DropdownOption } from '~/components/ui/dropdown';

interface ClientItemOptionsDropdownProps {
  clientId: string;
  userRoleHierarchy?: number;
}

export function ClientOptionsDropdown({
  clientId,
  userRoleHierarchy = 0,
}: ClientItemOptionsDropdownProps) {
  const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] =
    useState(false);
  const { t } = useTranslation('common');

  const { updateOrganizationSetting, pinned_organizations } =
    useOrganizationSettings();
  // Unpin function
  const unpinMutation = useMutation({
    mutationFn: async () => {
      const pinnedOrganizations: string[] = pinned_organizations
        ? JSON.parse(pinned_organizations)
        : [];
      const selectedClientIds = pinnedOrganizations.filter(
        (id: string) => id !== clientId,
      );
      await updateOrganizationSetting.mutateAsync({
        key: 'pinned_organizations',
        value: JSON.stringify(selectedClientIds),
      });
    },
  });
  // Dropdown options
  const dropdownOptions: DropdownOption[] = [
    // First section - Add space
    {
      value: (
        <Link
          href={`/embeds?accountId=${clientId}&action=create`}
          className="flex w-full items-center gap-2"
        >
          <Plus className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.addSpace')}
          </span>
        </Link>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Unpin client
    {
      value: (
        <button
          onClick={() => unpinMutation.mutate()}
          className="flex w-full items-center gap-2 text-left"
        >
          {unpinMutation.isPending ? (
            <Spinner className="h-4 w-4 text-gray-500" />
          ) : (
            <StarOff className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.unpinClient')}
          </span>
        </button>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Invite member
    {
      value: (
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.inviteMembers')}
          </span>
        </div>
      ),
      actionFn: () => {
        // Open the dialog directly instead of clicking the hidden button
        setIsInviteMembersDialogOpen(true);
      },
      includeSeparator: true,
    },

    // Projects
    {
      value: (
        <Link
          href={`/clients/organizations/${clientId}?section=projects`}
          className="flex w-full items-center gap-2"
        >
          <Layers className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.projects')}
          </span>
        </Link>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Members
    {
      value: (
        <Link
          href={`/clients/organizations/${clientId}?section=members`}
          className="flex w-full items-center gap-2"
        >
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.members')}
          </span>
        </Link>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Services
    {
      value: (
        <Link
          href={`/clients/organizations/${clientId}?section=services`}
          className="flex w-full items-center gap-2"
        >
          <Briefcase className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.services')}
          </span>
        </Link>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Files
    {
      value: (
        <Link
          href={`/clients/organizations/${clientId}?section=files`}
          className="flex w-full items-center gap-2"
        >
          <Archive className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.files')}
          </span>
        </Link>
      ),
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
  ];

  return (
    <>
      {/* Client Options Dropdown */}
      <Dropdown
        options={dropdownOptions}
        showSeparators={false}
        contentClassName="w-56 p-2 cursor-pointer"
      >
        <button
          className="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent"
          aria-label="Client options"
          type="button"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </Dropdown>

      {/* Invite Members Dialog - Controlled directly */}
      <InviteClientMembersDialogContainer
        clientOrganizationId={clientId}
        userRoleHierarchy={userRoleHierarchy}
        open={isInviteMembersDialogOpen}
        onOpenChange={setIsInviteMembersDialogOpen}
      ></InviteClientMembersDialogContainer>
    </>
  );
}
