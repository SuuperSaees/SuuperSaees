'use client';

import { Calendar } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { KanbanItem } from '~/(views)/kanban.types';
import { getPriorityClassName } from '~/(main)/orders/[id]/utils/generate-options-and-classnames';

import MultiAvatarDisplayer from '../../../components/ui/multiavatar-displayer';

const KanbanCard = ({
  item,
  className,
  ...rest
}: {
  item: KanbanItem;
  className?: string;
  [key: string]: unknown;
}) => {
  const avatars = item?.assignees ?? [];

  return (
    <div
      className={
        'flex cursor-pointer flex-col gap-2 rounded-md border border-gray-200 bg-white p-4 ' +
        className
      }
      {...rest}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between">
        <small className="max-w-14 truncate text-xs">#{item.id}</small>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 ${getPriorityClassName(item.priority)} ml-auto`} // todo: this is hardcoded (color)
        >
          <div className="h-1 w-1 rounded-full bg-current" />
          <small className="text-xs font-semibold capitalize">
            {item.priority}
          </small>
        </div>
      </div>
      {/*Main Content */}
      <div className="flex flex-col gap-1">
        <p className="line-clamp-1 text-sm font-bold font-medium text-black">
          {item.title}
        </p>
        <p className="line-clamp-2 text-sm text-xs text-gray-600">
          {item.description}
        </p>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <MultiAvatarDisplayer
          avatars={avatars}
          maxAvatars={3}
          avatarClassName="h-6 w-6 rounded-full text-xs"
        />
        {/* This button must be replaced with interaction one */}
        <Button
          variant="outline"
          className="h-7 w-7 rounded-full border-none p-0"
        >
          <Calendar className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default KanbanCard;
