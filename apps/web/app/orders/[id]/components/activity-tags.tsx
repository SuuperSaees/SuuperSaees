'use client';
import { useTranslation } from 'react-i18next';
import CheckboxCombobox, { CustomItemProps, Option } from '~/components/ui/checkbox-combobox';
import { z } from 'zod';
const CustomTagItem: React.FC<
  CustomItemProps<
    Option & {
      picture_url?: string;
    }
  >
> = ({ option }) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm">{option.label}</span>
  </div>
);

interface ActivityTagsProps {
    tags: {
        label: string;
        picture_url: string;
        value: string;
    }[];
    updateFunction: (data: {tags: string[]}) => void;
    searchTagOptions: {
        label: string;
        picture_url: string;
        value: string;
    }[];
    canAddTags: boolean;
}
const ActivityTags = ({tags, updateFunction, searchTagOptions, canAddTags}: ActivityTagsProps) => {
    const { t } = useTranslation('orders');
  return (
    <div className="flex flex-col gap-1">
        <span className="text-sm font-medium py-1.5">{t('details.tags')}</span>
        <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
            {
                tags.map((tag) => (
                    <div key={tag.value} className="bg-gray-100 rounded-md px-2 py-1 text-sm font-medium">
                        {tag.label}
                    </div>
                ))
            }
            {canAddTags && (
                <CheckboxCombobox
                    options={searchTagOptions ?? []}
                    onSubmit={updateFunction}
                    schema={z.object({
                        tags: z.array(z.string()),
                    })}
                    defaultValues={{
                        tags: tags.map((tag) => tag.value),
                    }}
                    customItem={CustomTagItem}
                />
            )}
        </div>
    </div>
  );
};

export default ActivityTags;
