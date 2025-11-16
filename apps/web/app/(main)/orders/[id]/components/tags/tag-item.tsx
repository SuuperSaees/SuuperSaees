import { convertToTitleCase } from '../../utils/format-agency-names';
import { Tags } from '~/lib/tags.types';
import { getContrastColor } from '~/utils/generate-colors';

const defaultTagColor = '#8fd6fc';

interface TagItemProps {
    tag: Tags.Type;
    onUpdate: (tag: { id: string; name: string; color: string }) => void;
    onDelete: (tagId: string) => void;
}

export const TagItem = ({ tag }: TagItemProps) => {
    return (
        <div className="flex items-center gap-1">
            <div
                style={{ 
                    backgroundColor: tag.color ?? defaultTagColor,
                    color: getContrastColor(tag.color ?? defaultTagColor)
                }}
                className="rounded-full px-2 py-1 text-sm font-medium"
            >
                {convertToTitleCase(tag.name)}
            </div>
        </div>
    );
};