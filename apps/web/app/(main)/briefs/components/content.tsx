import { ContentTypes } from '../types/brief.types';
import { ContentCard } from './content-card';
import Draggable from './draggable';

import type { JSX } from "react";

type Content = {
  name: string;
  icon: JSX.Element;
  action: () => void;
  type: ContentTypes;
};

interface ContentProps {
  content: Content[];
}

export default function Content({ content }: ContentProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="font-bold text-gray-600">Content</h3>
      <div className="flex w-full flex-wrap gap-2">
        {content.map((item, index) => (
          <Draggable
            key={'draggable-content-widget-' + index}
            id={'draggable-content-widget-' + index}
            className="flex h-auto w-full max-w-32 flex-1"
            data={{ type: item.type }}
          >
            <ContentCard
              key={index}
              name={item.name}
              icon={item.icon}
              action={item.action}
            />
          </Draggable>
        ))}
      </div>
    </div>
  );
}
