import { Tags } from '~/lib/tags.types';
import { TagItem } from './tag-item';
import { Button } from '@kit/ui/button';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { useState } from 'react';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from '@kit/ui/command';
import { convertToSnakeCase } from '../../utils/format-agency-names';
import { TagEditPopover } from './tag-edit-popover';

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
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-none bg-transparent hover:bg-slate-100 rounded-full"
                            disabled={isLoading}
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
                                            onSelect={handleCreateTag}
                                        >
                                            Create <span className="ml-4 font-bold px-2 rounded-md" style={{backgroundColor: defaultTagColor}}>{customTag}</span>
                                        </CommandItem>
                                    )}
                                    {searchTagOptions.map((tag) => (
                                        <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => onTagSelect(tag)}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            {selectedTags.some(t => t.id === tag.id) && (
                                                <span>✓</span>
                                            )}
                                            <div className="flex items-center p-2 rounded-md" style={{ backgroundColor: tag.color ?? defaultTagColor }}>
                                                {tag.name}
                                            </div>
                                            <div className="flex items-center gap-2">
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