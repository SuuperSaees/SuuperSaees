'use client';

import { StarFilledIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

import AvatarDisplayer from './avatar-displayer';
import { formatDate } from 'date-fns';

type User = {
  name: string;
  picture_url: string;
};
interface CardReviewsProps {
  title: string;
  content: string;
  createdAt: string;
  rating: number;
  user: User;
}
export default function CardReview({
  title,
  content,
  createdAt,
  rating,
  user,
}: CardReviewsProps) {
  const { t } = useTranslation('reviews');
  return (
    <div className="flex gap-2 rounded-md bg-gray-100/70 px-4 py-2 transition-all hover:bg-gray-50 text-sm">
      <AvatarDisplayer displayName={user.name} pictureUrl={user.picture_url} />
      <div className="flex flex-col gap-2">
        <span className="line-clamp-2 text-gray-600 font-semibold">{title}</span>
        <span >
          <span>
            {t('createdBy')}
            <strong> {user.name}, </strong>
          </span>
          <span>{t('date', { date: formatDate(createdAt, 'PP') })}</span>
        </span>
        <p className="line-clamp-4 text-gray-700 transition-all duration-300 hover:line-clamp-none">
          {content}
        </p>
        <div className="flex gap-1">
          {rating ? Array.from({ length: rating ?? 0 }, (_, i) => (
            <StarFilledIcon
              className="h-4 w-4 text-yellow-400"
              key={'start' + i}
            />
          )): <span className="text-gray-500">{t('rating.noRated')}</span>}
        </div>
      </div>
    </div>
  );
}
