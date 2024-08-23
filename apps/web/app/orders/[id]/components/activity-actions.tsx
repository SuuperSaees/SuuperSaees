'use client';

import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { Order } from '~/lib/order.types';

import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { Activity, ActivityType } from '../context/activity-context';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { formatDateToString } from '../utils/get-formatted-dates';
import AvatarDisplayer from './ui/avatar-displayer';

const translateActivity = (
  activity: Activity,
  t: TFunction<'logs', undefined>,
) => {
  const availableTranslates = ['status', 'priority'];
  const newActivity = { ...activity, class: 'activity' };
  newActivity.type = t(`types.${activity.type}`);
  if (availableTranslates.includes(activity.type)) {
    newActivity.value = t(`values.${activity.value}`);
  }
  newActivity.message = `${t(`messages.${activity.action}`)} ${activity.type === 'due_date' ? t('articles.due_date.singular.feminine') : ''}`;

  newActivity.preposition = t(`prepositions.${activity.preposition}`);
  return newActivity;
};
interface ActivityActionProps {
  activity: Activity;
  formattedActivity: Activity;
}
interface ActivityCustomSpan {
  value: string;
  translatedValue: string;
}

function formatTarget(target: string) {
  return target
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toLowerCase());
}

export const ActivityCustomSpan = ({
  value,
  translatedValue,
}: ActivityCustomSpan) => {
  const statuses = [
    Order.Enums.Status.PENDING,
    Order.Enums.Status.IN_PROGRESS,
    Order.Enums.Status.COMPLETED,
    Order.Enums.Status.ANNULLED,
  ];
  const priorities = [
    Order.Enums.Priority.LOW,
    Order.Enums.Priority.MEDIUM,
    Order.Enums.Priority.HIGH,
  ];

  const wordsToMark = [...statuses, ...priorities];

  // Find the first occurrence of any marked word
  const matchedWord = wordsToMark.find((word) => value.includes(word));

  if (!matchedWord) {
    return <span>{value}</span>;
  }

  // Split the message into two parts based on the matched word
  const [before, after] = value.split(matchedWord);

  return (
    <span>
      {before}
      <span
        className={`rounded-md ${
          statuses.includes(matchedWord as Order.Enums.Status)
            ? statusColors[matchedWord as Order.Enums.Status]
            : priorities.includes(matchedWord as Order.Enums.Priority)
              ? priorityColors[matchedWord as Order.Enums.Priority]
              : ''
        } px-2 py-1 font-semibold`}
      >
        {translatedValue}
      </span>
      {after}
    </span>
  );
};

const ActivityAction = ({
  activity,
}: Omit<ActivityActionProps, 'formattedActivity'>) => {
  const { t } = useTranslation('logs');
  const formattedActivity = translateActivity(activity, t);
  if (
    activity.type === ActivityType.STATUS ||
    activity.type === ActivityType.PRIORITY
  )
    return (
      <StatusActivity
        activity={activity}
        formattedActivity={formattedActivity}
      />
    );
  else
    return (
      <DefaultAction
        activity={activity}
        formattedActivity={formattedActivity}
      />
    );
};

export const StatusActivity = ({
  activity,
  formattedActivity,
}: ActivityActionProps) => {
  if (
    activity.type === ActivityType.STATUS ||
    activity.type === ActivityType.PRIORITY
  ) {
    return (
      <div className="flex h-fit w-full justify-between gap-4 pl-12 text-gray-400">
        <span className="inline-flex flex-wrap gap-1">
          <span>{formattedActivity.actor}</span>
          <span>{formattedActivity.message}</span>
          <span>{formatTarget(formattedActivity.type)}</span>
          <span>{formattedActivity.preposition}</span>
          <ActivityCustomSpan
            value={activity.value}
            translatedValue={formattedActivity.value}
          />
        </span>
        <small className="w-full max-w-[100px] text-right">
          {formatDateToString(new Date(formattedActivity.created_at), 'short')}
        </small>
      </div>
    );
  }
  return null;
};

export const DefaultAction = ({
  activity,
  formattedActivity,
}: ActivityActionProps) => {
  return (
    <div className="flex h-fit w-full justify-between gap-4 text-gray-400">
      <div className="flex gap-1">
        <AvatarDisplayer
          displayName={null}
          pictureUrl={formattedActivity.user.picture_url}
        />
        <span className="flex flex-wrap gap-1">
          <span>{formattedActivity.actor}</span>
          <span>{formattedActivity.message}</span>
          <span>{formatTarget(formattedActivity.type)}</span>
          <span>{formattedActivity.preposition}</span>
          <span>
            {activity.type === 'due_date'
              ? format(new Date(formattedActivity.value ?? ''), '	Pp')
              : formattedActivity.value}
          </span>
        </span>
      </div>
      <small className="w-full max-w-[100px] text-right">
        {formatDateToString(new Date(formattedActivity.created_at), 'short')}
      </small>
    </div>
  );
};
export default ActivityAction;