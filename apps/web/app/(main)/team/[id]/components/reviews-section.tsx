'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { usePagination } from '~/hooks/usePagination';
import { getOrdersReviewsForUser } from '~/team-accounts/src/server/actions/review/get/get-review';

import CardReview from '../../../../components/ui/card-review';
import Pagination from '../../../../components/ui/pagination';
import ReviewRating from '../../../../components/ui/review-rating';
import SkeletonReviewsSection from './skeleton';
import EmptyState from '~/components/ui/empty-state';

interface ReviewsSectionProps {
  userId: string;
  userRole: string;
}
export default function ReviewsSection({
  userId,
  userRole,
}: ReviewsSectionProps) {
  const { t } = useTranslation('reviews');

  const reviewsQuery = useQuery({
    queryKey: ['reviews', userId],
    queryFn: () => getOrdersReviewsForUser(userId),
    retry: 3,
    enabled:
      userRole === 'agency_owner' ||
      userRole === 'agency_member' ||
      userRole === 'agency_project_manager',
  });

  const reviews = reviewsQuery?.data ?? [];
  reviewsQuery.error && console.error('Error in client. Reviews Query error is:',reviewsQuery.error);
  const {
    startIndex,
    endIndex,
    currentPage,
    goToPage,
    previousPage,
    nextPage,
    totalPages,
  } = usePagination({
    totalItems: reviews?.length,
    pageSize: 4, // Define the number of items per page
  });
  const paginatedReviews = reviews?.slice(startIndex, endIndex) ?? [];

  const reviewWithRating = reviews?.filter((rev) => rev.rating !== null);
  const rating = Number(
    (reviewWithRating?.reduce((acc, review) => acc + (review?.rating ?? 0), 0) /
    reviewWithRating?.length).toFixed(2)
  );

  if (reviewsQuery.isLoading || reviewsQuery.isPending) {
    return <SkeletonReviewsSection />;
  }

  return (
    <div className="flex h-full max-h-full w-full flex-wrap gap-16 lg:flex-nowrap p-8">
      {!paginatedReviews?.length ? (
        <EmptyState 
          imageSrc='/images/illustrations/Illustration-cloud.svg'
          title={t('empty.title')}
          description={t('empty.description')}
        />
      ) : (
        <>
          <ReviewRating
            rating={rating}
            total={reviews?.length}
            className="shrink-0 p-8"
          />
          <div className="flex h-full w-full flex-col gap-4">
            {!paginatedReviews?.length ? (
              <span className="mx-auto text-sm text-gray-400">
                {t('empty')}
              </span>
            ) : (
              <div className="flex h-full w-full flex-col gap-4">
                {paginatedReviews?.map((review, index) => (
                  <CardReview
                    key={index}
                    title={review.order?.title ?? ''}
                    content={review.content}
                    createdAt={review.created_at}
                    rating={review.rating ?? 0}
                    user={{
                      name: review?.user?.name ??  review?.user?.settings?.name ?? '',
                      picture_url: review?.user?.picture_url ?? review?.user?.settings?.picture_url ?? '',
                    }}
                  />
                ))}
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  goToPage={goToPage}
                  previousPage={previousPage}
                  nextPage={nextPage}
                  className="mt-auto"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
