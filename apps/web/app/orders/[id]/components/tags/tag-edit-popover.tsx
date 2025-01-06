import { useState, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { Tags } from '~/lib/tags.types';
import { useTranslation } from 'react-i18next';

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
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
            >
                <Trash2 className="h-4 w-4 mr-2" />
            </Button>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <Pencil className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <Input
                            value={editingTag?.name ?? tag.name}
                            onChange={(e) => {
                                e.stopPropagation();
                                setEditingTag({ 
                                    ...tag, 
                                    name: e.target.value 
                                })
                            }}
                            className="h-8"
                        />
                        <div
                            className="h-8 w-8 cursor-pointer rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: editingTag?.color ?? tag.color ?? defaultTagColor }}
                            onClick={() => colorInputRef.current?.click()}
                        />
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
                        />
                    </div>
                    <div className="flex justify-between">

                        <div className="flex gap-2">
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
                            <Button
                                size="sm"
                                onClick={handleSave}
                            >
                                {t('save')}
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};