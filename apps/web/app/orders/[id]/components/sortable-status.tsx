import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@kit/ui/button';
import { GripVertical } from 'lucide-react';

import { AgencyStatus } from '~/lib/agency-statuses.types';

export function SortableStatus({
  status,
  children,
}: {
  status: AgencyStatus.Type;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      key={status.id}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex gap-1 items-center justify-between">
        {children}
        <Button
          variant="ghost"
          {...attributes}
          {...listeners}
          className="h-full p-1 cursor-grab"
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
