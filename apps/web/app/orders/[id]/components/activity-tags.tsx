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
import { createTag, deleteTag, updateTag } from '~/server/actions/tags/tags.action';
import { Tags } from '~/lib/tags.types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@kit/ui/button';
import { convertToTitleCase, convertToSnakeCase } from '../utils/format-agency-names';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Input } from '@kit/ui/input';
import { useAgencyStatuses } from '~/orders/components/context/agency-statuses-context';
import { useRef } from 'react';
// import { useQueryClient } from '@tanstack/react-query';

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
    const [customTag, setCustomTag] = useState('');
    const [searchTagOptionsFiltered, setSearchTagOptionsFiltered] = useState(searchTagOptions);
    const { tags } = useAgencyStatuses();
    const [selectedTags, setSelectedTags] = useState<Tags.Type[]>(tags);
    const [open, setOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tags.Type | null>(null);

    const colorInputRef = useRef<HTMLInputElement>(null);
    // const queryClient = useQueryClient();
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

    const updateTagMutation = useMutation({
        mutationFn: async (updatedTag: { id: string; name: string; color: string }) => {
            setSelectedTags(prev => prev.map(tag => tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag));
            setSearchTagOptionsFiltered(prev => prev.map(tag => tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag));
            return await updateTag({ id: updatedTag.id, name: updatedTag.name, color: updatedTag.color })
        },
        onSuccess: () => {
        //   queryClient.setQueryData(['tags'], (oldTags: Tag.Type[]) => {
        //     return oldTags.map(tag => 
        //       tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag
        //     );
        //   });
          toast.success('Tag updated successfully');
          setEditingTag(null);
          router.refresh();
        },
        onError: () => {
          toast.error('Failed to update tag');
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
                                                {editingTag?.id === tag.id ? (
                                                    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            value={editingTag.name}
                                                            onChange={(e) => setEditingTag({ 
                                                                ...editingTag, 
                                                                name: e.target.value 
                                                            })}
                                                            className="h-8 w-32"
                                                        />
                                                        <div
                                                            className="h-8 w-8 cursor-pointer rounded-full border-2 border-white shadow-md"
                                                            style={{ backgroundColor: editingTag.color ?? defaultTagColor }}
                                                            onClick={() => colorInputRef.current?.click()}
                                                        />
                                                        <input
                                                            ref={colorInputRef}
                                                            type="color"
                                                            value={editingTag.color ?? defaultTagColor}
                                                            onChange={(e) => setEditingTag({ 
                                                                ...editingTag, 
                                                                color: e.target.value ?? defaultTagColor
                                                            })}
                                                            className="sr-only h-8 w-8"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateTagMutation.mutate(editingTag)}
                                                        >
                                                            {t('save')}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setEditingTag(null)}
                                                        >
                                                            {t('cancel')}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div
                                                            className="mr-2 h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: tag.color ?? defaultTagColor }}
                                                        />
                                                        {convertToTitleCase(tag.name)}
                                                        <div className="ml-auto flex gap-2">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingTag(tag);
                                                                }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteTag(tag.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        {selectedTags.some(t => t.id === tag.id) && (
                                                            <span className="ml-2">✓</span>
                                                        )}
                                                    </>
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