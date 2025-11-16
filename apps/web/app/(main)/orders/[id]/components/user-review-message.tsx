import { StarFilledIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

import AvatarDisplayer from './ui/avatar-displayer';
import { DataResult } from '../context/activity.types';

interface UserReviewMessageProps {
  review: DataResult.Review;
}
const UserReviewMessage = ({ review }: UserReviewMessageProps) => {
  return (
    <div className="flex gap-2 w-full p-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 shrink-0">
        <Star className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between gap-4">
          <p className="font-semibold text-gray-600 text-sm">{`Left a ${review?.rating} star review:`}</p>
          <small className="shrink-0">
            {format(new Date(review?.created_at), 'MMM dd, p')}
          </small>
        </div>
        <div className="flex gap-2 rounded-lg rounded-ss-none bg-gray-50 p-3">
        <AvatarDisplayer
        displayName={review?.user?.settings?.picture_url ?? review?.user?.picture_url ? null : review?.user?.name}
        pictureUrl={review?.user?.settings?.picture_url ?? review?.user?.picture_url}
        text={review?.user?.settings?.name ?? review?.user?.name ? review?.user?.settings?.name ?? review?.user?.name : undefined}
      />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">{review?.user?.settings?.name ?? review?.user?.name}</span>
            <p className='text-sm'>{review?.content}</p>
            <div className="flex gap-1">
              {Array.from({ length: review?.rating ?? 0 }, (_, i) => (
                <StarFilledIcon
                  className="h-4 w-4 text-yellow-400"
                  key={'start' + i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserReviewMessage;