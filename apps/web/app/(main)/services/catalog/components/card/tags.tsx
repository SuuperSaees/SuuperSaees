import { Trans } from "@kit/ui/trans";
import { ServiceTagsProps } from "../../types/service-card";

export function ServiceTags({ tags }: ServiceTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tags.map((tag, index) => {
        const IconComponent = tag.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-1 rounded-lg ${tag.bgColor} px-3 py-1 text-xs font-medium ${tag.textColor}`}
          >
            <IconComponent className="h-3 w-3" />
            <Trans i18nKey={tag.key} defaults={tag.defaults} />
          </div>
        );
      })}
    </div>
  );
} 