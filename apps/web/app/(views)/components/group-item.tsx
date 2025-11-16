import { Eye, EyeOff, GripVertical } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { darkenColor, hexToRgba } from '~/utils/generate-colors';

import { ViewManageableProperty } from '../views.types';

// Example of draggable content
const GroupItem = ({
  group,
  onAction,
}: {
  group: ViewManageableProperty;
  onAction: () => void;
}) => {
  return (
    <div
      className="flex w-full items-center justify-between gap-2 rounded-full px-2 py-1"
      style={{
        backgroundColor: group.color ? hexToRgba(group.color, 0.2) : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <span
          className="text-sm font-semibold"
          style={{
            color: group.color ? darkenColor(group.color, 0.7) : undefined,
          }}
        >
          {group.name}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onAction}
        className="h-5 w-5 items-center justify-center border-none"
      >
        {group.visible ? (
          <Eye className="h-4 w-4 text-gray-400" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
      </Button>
    </div>
  );
};

export default GroupItem;
