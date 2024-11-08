'use client';

import { Brief } from '~/lib/brief.types';

import ServiceTags from './service-tags';

type BriefCardProps = {
  brief: Brief.Relationships.Services.Response | null;
  className?: string;
};

export default function BriefCard({ brief, className }: BriefCardProps) {
  if (!brief) return null;
  return (
    <div className={`relative flex h-fit max-h-96 w-full max-w-xs flex-col gap-2 ${className}`}>
      <div className="w-xs relative h-60 w-full overflow-hidden rounded-xl">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src={brief.image_url ?? '/images/fallbacks/service-1.png'}
          alt={brief.name ?? 'brief'}
          className="h-full w-full object-cover"
        />
        {brief.services?.length > 0 && (
          <ServiceTags
            services={brief.services}
            className="absolute bottom-4 left-4 flex-wrap"
            maxTags={2}
          />
        )}
      </div>
      <div className="line-clamp-4">
        {/* <small className="font-semibold text-purple">
          {brief.created_at}
        </small> */}
        <h3 className="text-xl font-semibold">{brief.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{brief.description}</p>
      </div>
    </div>
  );
}
