import { Trans } from "@kit/ui/trans";
import { ServiceTagsProps } from "../../types";

export function ServiceTags({ tags }: ServiceTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => {
        const IconComponent = tag.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${tag.bgColor} ${tag.textColor}`}
          >
            <IconComponent className="h-3 w-3" />
            <Trans i18nKey={tag.key} defaults={tag.defaults} />
          </div>
        );
      })}
    </div>
  );
} 