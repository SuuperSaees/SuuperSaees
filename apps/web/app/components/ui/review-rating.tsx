import { StarFilledIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

export default function ReviewRating({
  rating,
  total,
  className
}: {
  rating: number;
  total: number;
  className?: string;
}) {
  const { t } = useTranslation('reviews');
  const isValidRating = Number.isFinite(rating) && rating > 0;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="font-bold">{t('rating.title')}</span>
      <div className="flex gap-4 items-center">
        <span className="text-5xl font-bold text-black">{!isValidRating ? t('rating.empty') : rating}</span>
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {Array.from({ length: Math.floor(rating ?? 0) }, (_, i) => (
              <StarFilledIcon
                className="h-4 w-4 text-yellow-400"
                key={'start' + i}
              />
            ))}
          </div>
          <small className="text-gray-500">
            {total > 1 ?t('rating.total.plural', { total }) : t('rating.total.singular', { total })}
          </small>
        </div>
      </div>
    </div>
  );
}
