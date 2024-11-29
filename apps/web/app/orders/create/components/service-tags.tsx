'use client';
import { useMemo } from 'react';
import { Brief } from '~/lib/brief.types';

interface ServiceTagProps {
  services: Brief.Relationships.Services.Response['services'];
  className?: string;
  maxTags?: number;
}

export default function ServiceTags({ services, className }: ServiceTagProps) {
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
    <div className={`flex gap-2 ${className} text-sm max-w-full flex-wrap items-center`}>
      {services?.map((service, index) => {
        const tagColor = tagColors[index % tagColors.length];
        
        return (
          <div
            key={index}
            className={`h-fit boder-neutral-400 rounded-full border px-2 ${tagColor?.bgColor} ${tagColor?.textColor} ${tagColor?.borderColor} truncate font-semibold`}
          >
            {service.name}
          </div>
        );
      })}
    </div>
  );
}
