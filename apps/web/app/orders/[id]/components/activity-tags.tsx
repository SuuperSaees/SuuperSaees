'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
// import { CustomItemProps, Option } from '~/components/ui/checkbox-combobox';
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from '@kit/ui/command';
import { useMutation } from '@tanstack/react-query';
import { createTag, deleteTag } from '~/server/actions/tags/tags.action';
import { Tags } from '~/lib/tags.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@kit/ui/button';
import { convertToTitleCase, convertToSnakeCase } from '../utils/format-agency-names';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Plus, Trash2 } from 'lucide-react';
import { useAgencyStatuses } from '~/orders/components/context/agency-statuses-context';

// const CustomTagItem: React.FC<
//   CustomItemProps<
//     Option & {
//       picture_url?: string;
//     }
//   >
// > = ({ option }) => (
//   <div className="flex items-center space-x-2">
//     <span className="text-sm">{option.label}</span>
//   </div>
// );

const defaultTagColor = '#8fd6fc'

interface ActivityTagsProps {
    organizationId: string;
    orderId?: number;
    updateFunction: (tagIds: string[]) => void;
    searchTagOptions: Tags.Type[];
    canAddTags: boolean;
}
const ActivityTags = ({organizationId, updateFunction, searchTagOptions, canAddTags}: ActivityTagsProps) => {
    const { t } = useTranslation(['orders', 'responses']);
    const [open, setOpen] = useState(false);
    const [customTag, setCustomTag] = useState('');
    const [searchTagOptionsFiltered, setSearchTagOptionsFiltered] = useState(searchTagOptions);
    const { tags } = useAgencyStatuses();
    const [selectedTags, setSelectedTags] = useState<Tags.Type[]>(tags);
    const router = useRouter();
    const createTagMutation = useMutation({
        mutationFn: async ({ payload, orderIdForMutation }: { payload: Tags.Insert, orderIdForMutation: number | undefined }) => {
            return createTag(payload, orderIdForMutation);
        },
        onSuccess: (newTag: Tags.Type) => {
            setSelectedTags(prev => [...prev, newTag]);
            toast.success('Success', {
                description: 'New tag created successfully!',
            });
            router.refresh();
        },
        onError: () => {
            toast.error('Error', { description: 'Failed to create new tag.' });
        },
    });

    const deleteTagMutation = useMutation({
        mutationFn: async (tagId: string) => {
            setSearchTagOptionsFiltered(prev => prev.filter(tag => tag.id !== tagId));
            setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
            return await deleteTag(tagId);
        },
        onSuccess: () => {
            toast.success('Success', {
                description: 'Tag deleted successfully!',
            });
            router.refresh();
        },
        onError: () => {
            toast.error('Error', { description: 'Failed to delete tag.' });
        },

    });

    const handleCreateTag = () => {
        setOpen(false);
        createTagMutation.mutate({
            payload: {
                name: convertToSnakeCase(customTag),
                color: defaultTagColor,
                organization_id: organizationId,
            },
            orderIdForMutation: undefined
        });
        setCustomTag('');
    };

    const handleSelectTag = (tag: Tags.Type) => {
        const isSelected = selectedTags.some(t => t.id === tag.id);
        let newTags;
        
        if (isSelected) {
            newTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            newTags = [...selectedTags, tag];
        }
        
        setSelectedTags(newTags);
        updateFunction(newTags.map(t => t.id));
    };

    const handleDeleteTag = (tagId: string) => {
        deleteTagMutation.mutate(tagId);
    };

    return (
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium py-1.5">{t('details.tags')}</span>
            <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                    <div
                        key={tag.id}
                        style={{ backgroundColor: tag.color ?? defaultTagColor }}
                        className="rounded-full px-2 py-1 text-sm font-medium"
                    >
                        {convertToTitleCase(tag.name)}
                    </div>
                ))}
                
                {canAddTags && (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-none bg-transparent hover:bg-slate-100 rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput
                                    value={customTag}
                                    onValueChange={setCustomTag}
                                />
                                <CommandList>
                                    <CommandGroup>
                                        {customTag && (
                                            <CommandItem
                                                value={customTag}
                                                onSelect={() => {
                                                    handleCreateTag();
                                                }}
                                            >
                                                Create <span className="ml-4 font-bold px-2 rounded-md" style={{backgroundColor: defaultTagColor}}>{customTag}</span>
                                            </CommandItem>
                                        )}
                                        {searchTagOptionsFiltered.map((tag) => (
                                            <CommandItem
                                                key={tag.id}
                                                value={tag.name}
                                                onSelect={() => handleSelectTag(tag)}
                                            >
                                                <div
                                                    className="mr-2 h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: tag.color ?? defaultTagColor }}
                                                />
                                                {convertToTitleCase(tag.name)}
                                                <Button variant="ghost" size="icon" className="ml-auto" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTag(tag.id)}}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                {selectedTags.some(t => t.id === tag.id) && (
                                                    <span className="ml-auto">✓</span>
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
};

export default ActivityTags;