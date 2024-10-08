import { ThemedCheckbox } from '../../../../../packages/features/accounts/src/components/ui/checkbox-themed-with-settings';
import React from 'react';
import { useTranslation } from 'react-i18next';
interface Item {
    value: string,
    label: string,
}

interface BriefFormMultipleChoiceProps {
    items: Item[],
    title: string,
    description: string,
}

export function BriefFormMultipleChoice({ items, title, description }: BriefFormMultipleChoiceProps) {
  const { t } = useTranslation('briefs');
    return (
      <div>
        <div className='flex'>
          <input
            type="text"
            value={title}
            disabled={true}
            className="border-none focus:outline-none text-gray-600 text-sm font-medium"
            style={{ width: `${Math.max(title.length, t('multipleChoice.title').length) + 1}ch` }}
            placeholder={t('multipleChoice.title')}
          />
          <span className='block text-gray-600 text-sm font-medium'>*</span>
        </div>
        <div className='mb-[20px]'>
          <input
              type="text"
              value={description}
              disabled={true}
              className="border-none focus:outline-none text-gray-600 text-sm font-medium"
              style={{ width: `${Math.max(description.length, t('multipleChoice.description').length) + 1}ch` }}
              placeholder={t('multipleChoice.description')}
          />
        </div>
        {items.map((item) => (
            <div
                key={item.value}
                className="flex flex-row items-start space-x-3 space-y-0"
            >
                <div>
                    <ThemedCheckbox />
                </div>
                <label className="text-gray-700 text-[16px] font-medium leading-[1.5]">
                    {item.label}
                </label>
            </div>
        ))}
        </div>
    );
}