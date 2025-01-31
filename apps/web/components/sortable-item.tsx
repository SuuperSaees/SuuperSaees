import { Data } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState } from "react";

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  className?: string;
  data?: Data;
}

export function SortableItem({ id, children, className, data }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, data });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex ${className ?? "items-start"}`}>
        <div {...listeners} className="cursor-grab px-2 py-1">
          <GripVertical
            className={`h-4 w-4 text-gray-500 transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
