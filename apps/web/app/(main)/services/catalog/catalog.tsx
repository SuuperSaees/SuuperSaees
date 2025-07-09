"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "node_modules/@kit/ui/src/shadcn/pagination";
import { useTranslation } from "react-i18next";

import { Trans } from "@kit/ui/trans";

import { usePagination } from "~/hooks/usePagination";

import EmptyState from "~/components/ui/empty-state";
import { SkeletonCards } from "~/components/ui/skeleton";
import { SkeletonCardService } from "~/components/organization/skeleton-card-image";
import CatalogServiceCard from "./catalog-service-card";
import { getServicesByOrganizationId } from "~/server/actions/services/get-services";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
interface ServiceSectionProps {
  organizationId: string;
  isPublicView?: boolean;
  logoUrl?: string;
  themeColor?: string;
}
function ServicesCatalog({
  organizationId,
  logoUrl,
  themeColor,
}: ServiceSectionProps) {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services", organizationId],
    queryFn: async () =>
      await getServicesByOrganizationId(undefined, organizationId, true),
    enabled: !!organizationId,
  });

  // User role
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace?.role;


  const { t } = useTranslation("services");

  const totalItems = Array.isArray(services) ? services.length : 0;

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

  const validRoles = ["agency_owner", "agency_project_manager"];
  const canEditService = validRoles.includes(userRole ?? "");

  // Filter the services to only show public services
  const filteredServices = Array.isArray(services)
    ? canEditService
      ? services
      : services.filter((service) => service.visibility === "public")
    : [];

  // Slice the services data for the current page
  const paginatedServices = Array.isArray(filteredServices)
    ? filteredServices.slice(startIndex, endIndex)
    : [];

  return (
    <div className="flex h-full w-full flex-col gap-8">
      {isLoading ? (
        <SkeletonCards count={9} className="flex h-full w-full flex-wrap gap-8 max-w-7xl mx-auto">
          <SkeletonCardService className="max-w-sm w-full"/>
        </SkeletonCards>
      ) : paginatedServices.length === 0 || !paginatedServices ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-box.svg"
          title={t("catalog.empty.title")}
          description={t("catalog.empty.description")}
        />
      ) : (
        <div className="flex flex-col max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-2 w-full p-8 rounded-sm border-gray-200">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="logo"
                className="w-10 h-10 rounded-sm mx-auto"
              />
            )}
            <p className=" text-sm text-gray-600 text-center">
              <Trans
                i18nKey="services:catalog.description"
                defaults="Choose from our professional services to grow your business"
              />
            </p>
          </div>
          <div className="flex h-full w-full flex-wrap gap-8 mx-auto">
            {paginatedServices.map((service) => (
              <CatalogServiceCard
                service={service}
                key={service.id}
                logoUrl={logoUrl}
                userRole={userRole}
                themeColor={themeColor}
              />
            ))}
          </div>
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
                <Trans i18nKey={"common:pagination.previous"} />
              </PaginationPrevious>
            </PaginationItem>

            <div className="flex flex-1 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      className={`${currentPage === page - 1 ? "bg-gray-100" : ""} border-none hover:bg-gray-50`}
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
                <Trans i18nKey={"common:pagination.next"} />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default ServicesCatalog;
