import { Activity, ActivityType } from '../context/activity-context';
import { formatDateToString } from '../utils/get-formatted-dates';
import AvatarDisplayer from './ui/avatar-displayer';


interface ActivityActionProps {
  activity: Activity;
}

const ActivityAction = ({ activity }: ActivityActionProps) => {
  if (activity.type === ActivityType.STATUS)
    return <StatusActivity activity={activity} />;
  else return <DefaultAction activity={activity} />;
};

export const StatusActivity = ({ activity }: ActivityActionProps) => {
  if (activity.type === ActivityType.STATUS) {
    return (
      <div className="flex h-fit w-fit w-full justify-between gap-1 text-gray-400">
        <span>{activity.message}</span>
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