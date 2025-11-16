import { Tags } from '~/lib/tags.types';
import { useTranslation } from 'react-i18next';
import { TagItem } from './tag-item';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { useState } from 'react';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from '@kit/ui/command';
import { convertToSnakeCase, convertToTitleCase } from '../../utils/format-agency-names';
import { TagEditPopover } from './tag-edit-popover';
import { getContrastColor } from '~/utils/generate-colors';
import { Checkbox } from '@kit/ui/checkbox';

const defaultTagColor = '#8fd6fc';

interface TagListProps {
    selectedTags: Tags.Type[];
    searchTagOptions: Tags.Type[];
    onTagSelect: (tag: Tags.Type) => void;
    onTagUpdate: (tag: { id: string; name: string; color: string }) => void;
    onTagDelete: (tagId: string) => void;
    onTagCreate: (params: { payload: Tags.Insert }) => void;
    canAddTags: boolean;
    isLoading: boolean;
    organizationId: string;
}

export const TagList = ({ 
    selectedTags,
    searchTagOptions,
    onTagSelect,
    onTagUpdate,
    onTagDelete,
    onTagCreate,
    canAddTags,
    isLoading,
    organizationId
}: TagListProps) => {
    const { t } = useTranslation(['orders']);
    const [open, setOpen] = useState(false);
    const [customTag, setCustomTag] = useState('');

    const handleCreateTag = () => {
        setOpen(false);
        onTagCreate({
            payload: {
                name: convertToSnakeCase(customTag),
                color: defaultTagColor,
                organization_id: organizationId,
            }
        });
        setCustomTag('');
    };

    return (
        <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
                <TagItem
                    key={tag.id}
                    tag={tag}
                    onUpdate={onTagUpdate}
                    onDelete={onTagDelete}
                />
            ))}
            
            {canAddTags && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                    <button
                    className="mr-auto flex h-7 w-7 items-center justify-center rounded-full border-none bg-slate-50 text-slate-500 hover:shadow-sm"
                    disabled={isLoading}
                     >
                    <Plus className="h-4 w-4" />
                     </button>
                    </PopoverTrigger>
                    <PopoverContent
                            className="w-[300px] p-0"
                            sideOffset={5}
                            align="start"
                            side="bottom"
                    >
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
                                        onSelect={handleCreateTag}
                                    >
                                        {t('create')} <span 
                                            className="ml-4 font-bold px-2 rounded-md" 
                                            style={{
                                                backgroundColor: defaultTagColor,
                                                color: getContrastColor(defaultTagColor)
                                            }}
                                        >
                                            {customTag}
                                        </span>
                                    </CommandItem>
                                )}
                                {searchTagOptions.map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.id}
                                        onSelect={() => onTagSelect(tag)}
                                        className="group"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={selectedTags.some(t => t.id === tag.id)}
                                                    className="pointer-events-none"
                                                />
                                                <div 
                                                    className="flex items-center p-2 rounded-full" 
                                                    style={{ 
                                                        backgroundColor: tag.color ?? defaultTagColor,
                                                        color: getContrastColor(tag.color ?? defaultTagColor)
                                                    }}
                                                >
                                                    {convertToTitleCase(tag.name)}
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity  text-gray-500">
                                                <TagEditPopover
                                                    tag={tag}
                                                    onUpdate={onTagUpdate}
                                                    onDelete={onTagDelete}
                                                />
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
};