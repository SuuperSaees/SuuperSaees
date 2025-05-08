'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tags } from '~/lib/tags.types';
import { TagList } from './tags/tag-list';
import { useTagMutations } from '../hooks/tags/use-tags-mutations';
import { useAgencyStatuses } from '~/(main)/orders/components/context/agency-statuses-context';

interface ActivityTagsProps {
    organizationId: string;
    orderId?: number;
    updateFunction: (tagIds: string[]) => void;
    searchTagOptions: Tags.Type[];
    canAddTags: boolean;
}

const ActivityTags = ({
    organizationId,
    orderId,
    updateFunction,
    searchTagOptions,
    canAddTags
}: ActivityTagsProps) => {
    const { t } = useTranslation(['orders']);
    const { tags } = useAgencyStatuses();
    const [selectedTags, setSelectedTags] = useState<Tags.Type[]>(tags);
    const [searchTagOptionsFiltered, setSearchTagOptionsFiltered] = useState(searchTagOptions);

    const mutations = useTagMutations({
        organizationId,
        orderId,
        setSelectedTags,
        setSearchTagOptionsFiltered
    });

    const handleSelectTag = (tag: Tags.Type) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        const newTags = isSelected 
            ? selectedTags.filter(t => t.id !== tag.id)
            : [...selectedTags, tag];
        
        setSelectedTags(newTags);
        updateFunction(newTags.map(t => t.id));
    };

    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium py-1.5">{t('details.tags')}</span>
            <TagList 
                selectedTags={selectedTags}
                searchTagOptions={searchTagOptionsFiltered}
                onTagSelect={handleSelectTag}
                onTagUpdate={mutations.updateTag}
                onTagDelete={mutations.deleteTag}
                onTagCreate={mutations.createTag}
                canAddTags={canAddTags}
                isLoading={mutations.isLoading}
                organizationId={organizationId}
            />
        </div>
    );
};

export default ActivityTags;