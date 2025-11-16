import { useState, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { Tags } from '~/lib/tags.types';
import { useTranslation } from 'react-i18next';
import { convertToSnakeCase, convertToTitleCase } from '../../utils/format-agency-names';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

const defaultTagColor = '#8fd6fc';

interface TagEditPopoverProps {
    tag: Tags.Type;
    onUpdate: (tag: { id: string; name: string; color: string }) => void;
    onDelete: (tagId: string) => void;
}

export const TagEditPopover = ({ tag, onUpdate, onDelete }: TagEditPopoverProps) => {
    const { t } = useTranslation(['orders']);
    const [open, setOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tags.Type | null>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (editingTag) {
            onUpdate({
                id: editingTag.id,
                name: editingTag.name,
                color: editingTag.color ?? defaultTagColor
            });
            setEditingTag(null);
            setOpen(false);
        }
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onDelete(tag.id);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent hover:text-gray-500" onClick={(e) => e.stopPropagation()}>
                    <Pencil className="h-5 w-5 mr-2" />
                </Button>
            </PopoverTrigger>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="hover:bg-transparent hover:text-gray-500 p-0"
            >
                <Trash2 className="h-5 w-5" />
            </Button>
            <PopoverContent className="w-80" 
                side="bottom"
                align="start"
                sideOffset={20}
                onClick={(e) => e.stopPropagation()}>
                <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <Input
                            value={convertToTitleCase(editingTag?.name ?? tag.name)}
                            onChange={(e) => {
                                e.stopPropagation();
                                setEditingTag({ 
                                    ...tag, 
                                    name: convertToSnakeCase(e.target.value)
                                })
                            }}
                            className="h-8 w-[80%]"
                        />
                        <div
                              className="w-10 h-10 cursor-pointer rounded-full border-4 border-white shadow-lg transition-transform hover:scale-110"
                            style={{ backgroundColor: editingTag?.color ?? tag.color ?? defaultTagColor }}
                            onClick={() => colorInputRef.current?.click()}
                        ></div>
                        <input
                            ref={colorInputRef}
                            type="color"
                            value={editingTag?.color ?? tag.color ?? defaultTagColor}
                            onChange={(e) => {
                                e.stopPropagation();
                                setEditingTag({ 
                                    ...tag, 
                                    color: e.target.value 
                                })
                            }}
                            className="sr-only"
                            aria-label="Choose color"
                        />
                    </div>

                        <div className="flex gap-2 justify-between w-full">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                }}
                            >
                                {t('cancel')}
                            </Button>
                            <ThemedButton
                                size="sm"
                                onClick={handleSave}
                            >
                                {t('save')}
                            </ThemedButton>
                        </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};