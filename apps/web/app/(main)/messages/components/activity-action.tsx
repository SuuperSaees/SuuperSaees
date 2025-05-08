'use client';

import { format } from 'date-fns';

import { Activity } from '~/lib/activity.types';

import Avatar from '../../../components/ui/avatar';

interface ActivityActionProps {
  activity: Activity.Type;
  formattedActivity: Activity.Type;
}

function formatTarget(target: string) {
  return target
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toLowerCase());
}

const ActivityAction = ({
  activity,
}: Omit<ActivityActionProps, 'formattedActivity'>) => {
  const formattedActivity = activity;

  return (
    <DefaultAction activity={activity} formattedActivity={formattedActivity} />
  );
};

export const DefaultAction = ({
  activity,
  formattedActivity,
}: ActivityActionProps) => {
  return (
    <div className="flex h-fit w-full justify-between gap-2">
      <div className="flex gap-2 text-sm">
        <Avatar
          username={formattedActivity.user?.name}
          src={formattedActivity.user?.picture_url ?? ''}
          alt={formattedActivity.user?.name ?? ''}
        />
        <span className="flex flex-wrap items-center gap-1">
          <span className="font-semibold">{formattedActivity.actor}</span>
          <span>{formattedActivity.message}</span>
          <span>{formatTarget(formattedActivity.type)}</span>
          <span>{formattedActivity.preposition}</span>
        </span>
      </div>
      <small>{format(new Date(activity.created_at), 'MMM dd, p')}</small>
    </div>
  );
};

export default ActivityAction;
