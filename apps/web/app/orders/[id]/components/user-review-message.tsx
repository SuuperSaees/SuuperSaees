import { StarFilledIcon } from '@radix-ui/react-icons';
import { Star } from 'lucide-react';

import { Review } from '../context/activity-context';
import { formatDateToString } from '../utils/get-formatted-dates';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserReviewMessageProps {
  review: Review;
}
const UserReviewMessage = ({ review }: UserReviewMessageProps) => {
  return (
    <div className="flex gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
        <Star className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="flex flex-col">
        <div className="flex gap-4 justify-between">
          <p className="font-semibold text-gray-600">{`Left a ${review?.rating} star review:`}</p>
          <small className="text-gray-400">
            {formatDateToString(new Date(review?.created_at), 'short')}
          </small>
        </div>
        <div className="flex gap-1 rounded-lg rounded-ss-none bg-gray-50 p-3">
          <AvatarDisplayer
            pictureUrl={review?.user?.picture_url}
            displayName={null}
            text={review?.user.name ? review.user.name : undefined}
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{review?.user?.name}</span>
            <p>{review?.content}</p>
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
