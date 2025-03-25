'use client';

import React from 'react';

import { Edit, EllipsisVertical, Plus, Trash2 } from 'lucide-react';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { Trans, useTranslation } from 'react-i18next';

import Dropdown from '~/components/ui/dropdown';

import { DynamicIcon } from '../../../app/components/shared/dynamic-icon';

type EmbedTabProps = {
  id: string;
  title: string;
  icon?: string | null;
  activeTab: string;
  onDelete?: (id: string) => Promise<void> | void;
  onEdit?: (id: string) => Promise<void> | void;
};

export function EmbedTab({
  id,
  title,
  icon,
  activeTab,
  onDelete,
  onEdit,
}: EmbedTabProps) {
  const isActive = activeTab === id;

  const options = [
    {
      value: (
        <span className="inline-flex w-full items-center gap-2 text-gray-600">
          <Edit className="h-5 w-5" />
          <Trans i18nKey={'embeds:form.edit'} />
        </span>
      ),
      actionFn: async () => {
        if (onEdit) {
          await onEdit(id);
        }
      },
    },
    {
      value: (
        <span className="inline-flex w-full items-center gap-2 text-gray-600">
          <Trash2 className="h-5 w-5" />
          <Trans i18nKey={'embeds:form.delete'} />
        </span>
      ),
      actionFn: async () => {
        if (onDelete) {
          await onDelete(id);
        }
      },
    },
  ];

  return (
    <ThemedTabTrigger
      activeTab={activeTab}
      option={id}
      value={id}
      className="group flex items-center gap-2 font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
    >
      <DynamicIcon name={icon ?? ''} className="h-4 w-4" />
      <span>{title}</span>
      {(onDelete ?? onEdit) && (
        <Dropdown
          showSeparators={false}
          options={options}
          className={isActive ? 'visible' : 'invisible group-hover:visible'}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Dropdown>
      )}
    </ThemedTabTrigger>
  );
}

export function AddIntegrationTab({ activeTab }: { activeTab: string }) {
  const { t } = useTranslation('embeds');
  return (
    <ThemedTabTrigger
      activeTab={activeTab}
      option="new"
      value="new"
      className="flex items-center gap-2 font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
    >
      <Plus className="h-4 w-4" />
      <span>{t('form.addButton')}</span>
    </ThemedTabTrigger>
  );
}

export function StandardTab({
  option,
  activeTab,
  label,
}: {
  option: string;
  activeTab: string;
  label: string;
}) {
  return (
    <ThemedTabTrigger
      activeTab={activeTab}
      option={option}
      value={option}
      className="flex items-center gap-2 font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
    >
      {label}
    </ThemedTabTrigger>
  );
}
