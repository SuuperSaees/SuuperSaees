'use client';

import { useQuery } from '@tanstack/react-query';
import { getClientServices } from 'node_modules/@kit/team-accounts/src/server/actions/services/get/get-services';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from 'node_modules/@kit/ui/src/shadcn/pagination';
import { useTranslation } from 'react-i18next';

import { Trans } from '@kit/ui/trans';

import { usePagination } from '~/hooks/usePagination';

import EmptyState from '../ui/empty-state';
import { SkeletonCards } from '../ui/skeleton';
import ServiceCard from './service-card';
import { SkeletonCardService } from './skeleton-card-image';

// import { getServicesByOrganizationId } from "node_modules/@kit/team-accounts/src/server/actions/services/get/get-services-by-organization-id";
interface ServiceSectionProps {
  organizationId: string;
  currentUserRole: string;
}
function ServiceSection({
  organizationId,
  currentUserRole,
}: ServiceSectionProps) {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services', organizationId],
    queryFn: async () => await getClientServices(organizationId),
  });

  const { t } = useTranslation('services');

  const totalItems = services?.length ?? 0;

  // Use the pagination hook
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    nextPage,
    previousPage,
    goToPage,
  } = usePagination({
    totalItems,
    pageSize: 8, // Define the number of items per page
  });

  // Slice the services data for the current page
  const paginatedServices = services?.slice(startIndex, endIndex) ?? [];

  return (
    <div className="flex h-full flex-col gap-8">
      {isLoading ? (
        <SkeletonCards count={8} className="flex h-full w-full flex-wrap gap-8">
          <SkeletonCardService />
        </SkeletonCards>
      ) : (paginatedServices.length === 0 ?? !paginatedServices) ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-box.svg"
          title={t(
            `${currentUserRole === 'agency_owner' || currentUserRole === 'agency_project_manager' ? 'empty.agency.title' : 'empty.client.title'}`,
          )}
          description={t(
            `${currentUserRole === 'agency_owner' || currentUserRole === 'agency_project_manager' ? 'empty.agency.description' : 'empty.client.description'}`,
          )}
        />
      ) : (
        <div className="flex h-full w-full flex-wrap gap-8">
          {paginatedServices.map((service) => (
            <ServiceCard
              currentUserRole={currentUserRole}
              service={service}
              key={service.subscription_id}
              clientOrganizationId={organizationId}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-auto border-t p-4">
          <PaginationContent className="flex w-full items-center justify-between">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  previousPage();
                }}
              >
                <Trans i18nKey={'common:pagination.previous'} />
              </PaginationPrevious>
            </PaginationItem>

            <div className="flex flex-1 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className={`${currentPage === page - 1 ? 'bg-gray-100' : ''} border-none hover:bg-gray-50`}
                      href="#"
                      isActive={currentPage === page - 1}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page - 1);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              {totalPages > 3 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </div>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  nextPage();
                }}
              >
                <Trans i18nKey={'common:pagination.next'} />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default ServiceSection;