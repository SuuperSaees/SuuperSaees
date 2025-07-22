'use client';

import { format, parseISO } from 'date-fns';
import { BarChart, Calendar, LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { darkenColor } from '~/utils/generate-colors'
import { Order } from '~/lib/order.types';

import type { TFunction } from '../../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { priorityColors } from '../utils/get-color-class-styles';
import AvatarDisplayer from './ui/avatar-displayer';
import { convertToTitleCase } from '../utils/format-agency-names';
import { formatDisplayDate } from '@kit/shared/utils';
import { ActivityType, DataResult } from '../context/activity.types';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import FileWithOptions from '../hoc/with-file-options';
import { useActivityContext } from '../context/activity-context';
import AnnotationsDialog from '~/(annotations)/components/dialog';
4
const translateActivity = (
  activity: DataResult.Activity,
  t: TFunction<'logs', undefined>,
) => {
  const availableTranslates = ['status', 'priority'];
  const availableTranslatesStatus = ['pending', 'in_progress', 'completed', 'annulled', 'anulled', 'in_review'];
  const availableTranslatesPriority = ['low', 'medium', 'high'];
  const newActivity = { ...activity, class: 'activity' };
  newActivity.type = t(`types.${activity.type}`);

  if (availableTranslates.includes(activity.type) && availableTranslatesStatus.includes(activity.value) || availableTranslatesPriority.includes(activity.value)) {
    newActivity.value = t(`values.${activity.value}`);
  } else {
    newActivity.value = convertToTitleCase(activity.value);
  }
  let article = '';
  if (activity.type === 'title') {
    article = t('articles.title.singular.masculine'); 
  } else if (activity.type === 'priority') {
    article = t('articles.priority.singular.feminine'); 
  } else if (activity.type === 'status') {
    article = t('articles.status.singular.masculine'); 
  }

  newActivity.message = `${t(`messages.${activity.action}`)} ${article} ${activity.type === 'due_date' ? t('articles.due_date.singular.feminine') : ''}`;

  newActivity.preposition = t(`prepositions.${activity.preposition}`);
  return newActivity;
};
interface ActivityActionProps {
  activity: DataResult.Activity;
  formattedActivity: DataResult.Activity;
  agencyStatuses?: AgencyStatus.Type[];
}
interface ActivityCustomSpan {
  value: string;
  translatedValue: string;
  agencyStatuses?: AgencyStatus.Type[];
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
  agencyStatuses,
}: ActivityCustomSpan) => {
  const priorities = [
    Order.Enums.Priority.LOW,
    Order.Enums.Priority.MEDIUM,
    Order.Enums.Priority.HIGH,
  ];

  const statusNames = agencyStatuses?.map(status => status.status_name) ?? [];
  const wordsToMark = [...statusNames, ...priorities];

  // Find the first occurrence of any marked word
  const matchedWord = wordsToMark.find((word) => value.includes(word ?? ''));

  if (!matchedWord) {
    return <span className='font-semibold'>{convertToTitleCase(value)}</span>;
  }

  // Split the message into two parts based on the matched word
  const [before, after] = value.split(matchedWord);
  const statusColor = agencyStatuses?.find(
    status => status.status_name?.toLowerCase() === value.toLowerCase()
  )?.status_color;
  return (
    <span>
      {before}
      <span
        className={`rounded-md ${ priorities.includes(matchedWord as Order.Enums.Priority)
              ? priorityColors[matchedWord as Order.Enums.Priority]
              : ''
        } px-2 py-1 font-semibold`}
        style={{
          color: statusColor ? darkenColor(statusColor, 0.55) : undefined,
          backgroundColor: statusColor ?? undefined,
        }}
      >
        {translatedValue}
      </span>
      {after}
    </span>
  );
};

const ActivityAction = ({
  activity,
  agencyStatuses,
}: Omit<ActivityActionProps, 'formattedActivity'>) => {
  const { t } = useTranslation('logs');
  const formattedActivity = translateActivity(activity, t);
  if (
    activity.type === ActivityType.STATUS ||
    activity.type === ActivityType.PRIORITY ||
    activity.type === ActivityType.DUE_DATE
  )
    return (
      <StatusActivity
        activity={activity}
        formattedActivity={formattedActivity}
        agencyStatuses={agencyStatuses}
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
  agencyStatuses,
}: ActivityActionProps) => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  if (
    activity.type === ActivityType.STATUS ||
    activity.type === ActivityType.PRIORITY ||
    activity.type === ActivityType.DUE_DATE ||
    activity.type === ActivityType.TASK
  ) {
    return (
      <div className="flex h-fit w-full justify-between gap-4">
        <div className="flex gap-2 align-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 shrink-0">
            {activity.type === ActivityType.PRIORITY ? (
              <BarChart className="h-4 w-4" />
            ) : activity.type === ActivityType.DUE_DATE ? (
              <Calendar className="h-4 w-4" />
            ) : activity.type === ActivityType.STATUS ? (
              <LineChart className="h-4 w-4" />
            ) : null}
          </div>
          <span className="inline-flex flex-wrap gap-1 text-sm items-center">
            <span className='font-semibold'>{formattedActivity.actor}</span>
            <span>{formattedActivity.message}</span>
            <span>{formatTarget(formattedActivity.type)}</span>
            <span>{formattedActivity.preposition}</span>
            <span>
              {activity.type === 'due_date' &&
                formatDisplayDate(parseISO(formattedActivity.value ?? ''), language, true)}
            </span>
            {(activity.type === 'priority' || activity.type === 'status') && (
              <ActivityCustomSpan
                value={activity.value}
                translatedValue={formattedActivity.value}
                agencyStatuses={agencyStatuses}
              />
            )}
          </span>
        </div>
        <small className="">
          {format(new Date(formattedActivity.created_at), 'MMM dd, p')}
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
  const { i18n } = useTranslation();
  const language = i18n.language;

  let isFileValue = false;

  let parsedValue = activity.value;

  if (typeof activity.value === 'string' && activity.value.includes('[')) {
    try {
      parsedValue = JSON.parse(activity.value); 
      isFileValue = Array.isArray(parsedValue) && parsedValue.length === 2; 
    } catch (e) {
      console.error("Error al parsear activity.value", e);
      isFileValue = false; 
    }
  } else if (Array.isArray(activity.value) && activity.value.length === 2) {
    isFileValue = true; 
  }

  const [fileName, fileId] = isFileValue ? parsedValue : [];

  const { allFiles } = useActivityContext();

  const file = allFiles?.find((file) => file.id === fileId);

  return (
    <div className="flex h-fit w-full justify-between gap-2">
      <div className="flex gap-2 text-sm">
        <AvatarDisplayer
          displayName={
            formattedActivity.user.settings?.picture_url ?? formattedActivity.user.picture_url
              ? null
              : formattedActivity.user?.settings?.name ?? formattedActivity.user.name
          }
          pictureUrl={
            formattedActivity.user.settings?.picture_url ?? formattedActivity.user.picture_url
          }
        />
        <span className="flex flex-wrap items-center gap-1">
          <span className='font-semibold'>{formattedActivity.actor}</span>
          <span>{formattedActivity.message}</span>
          <span>{formatTarget(formattedActivity.type)}</span>
          <span>{formattedActivity.preposition}</span>
          {isFileValue ? (
            <span className="flex items-center">
              <AnnotationsDialog
                file={file}
                triggerComponent={<button className="text-blue-500 hover:underline">
                  {file?.name}
                </button>}
                fileName={file?.name ?? ''}
                files={allFiles ?? []}
              />
            </span>
          ) : (
            <span>
              {activity.type === 'due_date'
                ? formatDisplayDate(parseISO(formattedActivity.value ?? ''), language)
                : formattedActivity.value}
            </span>
          )}
        </span>
      </div>
      <small>{format(new Date(activity.created_at), 'MMM dd, p')}</small>
    </div>
  );
};

export default ActivityAction;
