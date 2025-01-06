import { convertToTitleCase } from '../../utils/format-agency-names';
import { Tags } from '~/lib/tags.types';
// import { TagEditPopover } from './tag-edit-popover';

const defaultTagColor = '#8fd6fc';

interface TagItemProps {
    tag: Tags.Type;
    onUpdate: (tag: { id: string; name: string; color: string }) => void;
    onDelete: (tagId: string) => void;
}

export const TagItem = ({ tag, onUpdate, onDelete }: TagItemProps) => {
    return (
        <div className="flex items-center gap-1">
            <div
                style={{ backgroundColor: tag.color ?? defaultTagColor }}
                className="rounded-full px-2 py-1 text-sm font-medium"
            >
                {convertToTitleCase(tag.name)}
            </div>
            {/* <TagEditPopover
                tag={tag}
                onUpdate={onUpdate}
                onDelete={onDelete}
            /> */}
        </div>
    );
};