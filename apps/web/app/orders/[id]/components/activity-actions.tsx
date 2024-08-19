import { Order } from '~/lib/order.types';

import { Activity, ActivityType } from '../context/activity-context';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { formatDateToString } from '../utils/get-formatted-dates';
import AvatarDisplayer from './ui/avatar-displayer';

interface ActivityActionProps {
  activity: Activity;
}
interface ActivityCustomMessageProps {
  message: string;
}
export const ActivityCustomMessage = ({
  message,
}: ActivityCustomMessageProps) => {
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
  const matchedWord = wordsToMark.find((word) => message.includes(word));

  if (!matchedWord) {
    return <span>{message}</span>;
  }

  // Split the message into two parts based on the matched word
  const [before, after] = message.split(matchedWord);

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
        {matchedWord}
      </span>
      {after}
    </span>
  );
};

const ActivityAction = ({ activity }: ActivityActionProps) => {
  if (
    activity.type === ActivityType.STATUS ||
    activity.type === ActivityType.PRIORITY
  )
    return <StatusActivity activity={activity} />;
  else return <DefaultAction activity={activity} />;
};

export const StatusActivity = ({ activity }: ActivityActionProps) => {
  if (
    activity.type === ActivityType.STATUS ||
    activity.type === ActivityType.PRIORITY
  ) {
    return (
      <div className="flex h-fit w-fit w-full justify-between gap-1 text-gray-400">
        <ActivityCustomMessage message={activity.message} />
        <small>
          {formatDateToString(new Date(activity.created_at), 'short')}
        </small>
      </div>
    );
  }
  return null;
};

export const DefaultAction = ({ activity }: ActivityActionProps) => {
  return (
    <div className="flex h-fit w-fit w-full justify-between gap-1 text-gray-400">
      <div className="flex gap-1">
        <AvatarDisplayer
          displayName={null}
          pictureUrl={activity.user.picture_url}
        />
        <span>{activity.message}</span>
      </div>
      <small>
        {formatDateToString(new Date(activity.created_at), 'short')}
      </small>
    </div>
  );
};
export default ActivityAction;
