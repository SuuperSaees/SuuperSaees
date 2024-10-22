'use client';
import { useMemo } from 'react';
import { Brief } from '~/lib/brief.types';

interface ServiceTagProps {
  services: Brief.Relationships.Services.Response['services'];
  className?: string;
  maxTags?: number;
}

export default function ServiceTags({ services, className, maxTags=4 }: ServiceTagProps) {
  const tagColors = useMemo(
    () => [
      {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
      },
      {
        bgColor: 'bg-violet-100',
        textColor: 'text-violet-800',
        borderColor: 'border-violet-300',
      },
      {
        bgColor: 'bg-fuchsia-100',
        textColor: 'text-fuchsia-800',
        borderColor: 'border-fuchsia-300',
      },
      {
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-800',
        borderColor: 'border-cyan-300',
      },
      {
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-800',
        borderColor: 'border-teal-300',
      },
    ],
    []
  );



  return (
    <div className={`flex gap-2 ${className} text-sm max-w-full`}>
      {services?.map((service, index) => {
        // Assign a deterministic tag color based on the service's index
        const tagColor = tagColors[index % tagColors.length];

        if (index + 1 === services.length && index + 1 > maxTags) {
          return (
            <div
              key={index}
              className="h-fit flex items-center gap-1 truncate rounded-full border border-neutral-200 bg-gray-100 px-2 text-sm font-medium text-gray-500"
            >
              +{services.length - index}
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className={`h-fit boder-neutral-400 rounded-full border px-2 ${tagColor?.bgColor} ${tagColor?.textColor} ${tagColor?.borderColor} truncate font-semibold`}
            >
              {service.name}
            </div>
          );
        }
      })}
    </div>
  );
}
