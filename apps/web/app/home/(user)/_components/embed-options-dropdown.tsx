'use client';

import Link from 'next/link';

import { MoreHorizontal, Pen, Trash } from 'lucide-react';

import Dropdown, { DropdownOption } from '~/components/ui/dropdown';

export function EmbedOptionsDropdown({ embedId, accountId }: { embedId: string, accountId?: string }) {
  const dropdownOptions: DropdownOption[] = [
    {
      value: (
        <Link
          href={`/embeds?id=${embedId}&action=edit`}
          className="flex w-full items-center gap-2"
        >
          <Pen className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Edit</span>
        </Link>
      ),
      actionFn: () => {
        null;
      },
    },
    {
      value: (
        <Link
          href={ accountId ? `/embeds?id=${embedId}&action=delete&accountId=${accountId}` : `/embeds?id=${embedId}&action=delete`}
          className="flex w-full items-center gap-2"
        >
          <Trash className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Delete</span>
        </Link>
      ),
      actionFn: () => {
        null;
      },
    },
  ];

  return (
    <Dropdown
      options={dropdownOptions}
      contentClassName="w-56 p-2 cursor-pointer"
      showSeparators={false}
    >
      <button
        className="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
        aria-label="Client options"
        type="button"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </Dropdown>
  );
}
