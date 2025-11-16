'use client';

import { Brief } from '~/lib/brief.types';

import ServiceTags from './service-tags';

type BriefCardProps = {
  brief: Brief.Relationships.Services.Response | null;
  className?: string;
  selected?: boolean;
  SelectIcon?: React.ComponentType<{ className?: string }>;
};

export default function BriefCard({ brief, className, selected, SelectIcon }: BriefCardProps) {
  if (!brief) return null;
  return (
    <div className={`relative flex w-[353px] flex-col gap-2 ${className}`}>
      <div className="relative h-[172px] w-full overflow-hidden rounded-xl">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src={brief.image_url ?? '/images/fallbacks/service-1.png'}
          alt={brief.name ?? 'brief'}
          className="h-full w-full object-cover"
          width="353"
          height="172"
        />
        {SelectIcon && (
          <div className="absolute right-4 top-4">
            <SelectIcon className={`h-6 w-6 ${selected ? 'text-purple' : 'text-white'}`} />
          </div>
        )}
        {brief.services?.length > 0 && (
          <ServiceTags
            services={brief.services}
            className="absolute bottom-4 left-4 flex-wrap"
            maxTags={2}
          />
        )}
      </div>
      <div className="line-clamp-4 gap-4">
        {/* <small className="font-semibold text-purple">
          {brief.created_at}
        </small> */}
        <h3 className="text-[#181D27] text-[16px] font-semibold leading-[18.128px]">{brief.name}</h3>
        <p className="text-[#535862] text-[14px] font-normal leading-[18.128px]">{brief.description}</p>
      </div>
    </div>
  );
}
