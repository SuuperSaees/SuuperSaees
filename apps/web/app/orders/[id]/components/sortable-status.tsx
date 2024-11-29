import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
      {...attributes}
      {...listeners}
    >

      {children}
        

    </div>
  );
}
