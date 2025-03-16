'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  Archive,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react';

import { Separator } from '@kit/ui/separator';

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
          <span className="text-sm font-medium text-gray-700">Add space</span>
        </Link>
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
            Invite member
          </span>
        </div>
      ),
      actionFn: () => {
        // Open the dialog directly instead of clicking the hidden button
        setIsInviteMembersDialogOpen(true);
      },
    },
    // Custom separator as a dropdown option
    {
      value: <Separator className="my-1" />,
      actionFn: () => {
        // Link handles the navigation
        null;
      },
    },
    // Projects
    {
      value: (
        <Link
          href={`/clients/organizations/${clientId}?section=projects`}
          className="flex w-full items-center gap-2"
        >
          <Layers className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Projects</span>
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
          <span className="text-sm font-medium text-gray-700">Members</span>
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
          <LayoutGrid className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Services</span>
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
          <span className="text-sm font-medium text-gray-700">Files</span>
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
          className="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
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
      >

      </InviteClientMembersDialogContainer>
    </>
  );
}
