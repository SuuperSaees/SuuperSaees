'use client';

import Link from 'next/link';

import { MoreHorizontal, Pen, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Dropdown, { DropdownOption } from '~/components/ui/dropdown';

export function EmbedOptionsDropdown({
  embedId,
  accountId,
}: {
  embedId: string;
  accountId?: string;
}) {
  const { t } = useTranslation('common');
  const dropdownOptions: DropdownOption[] = [
    {
      value: (
        <Link
          href={`/embeds?accountId=${accountId}&action=edit&id=${embedId}`}
          className="flex w-full items-center gap-2"
        >
          <Pen className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.edit')}
          </span>
        </Link>
      ),
      actionFn: () => {
        null;
      },
    },
    {
      value: (
        <Link
          href={`/embeds?accountId=${accountId}&action=delete&id=${embedId}`}
          className="flex w-full items-center gap-2"
        >
          <Trash className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {t('sidebar.delete')}
          </span>
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
        className="flex h-6 w-6 items-center justify-center rounded-full border-none bg-transparent transition-all duration-200"
        aria-label="Embed options"
        type="button"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </Dropdown>
  );
}
