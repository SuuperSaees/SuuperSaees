"use client";


import { useTranslation } from "react-i18next";

import { Trans } from "@kit/ui/trans";

import EmptyState from "~/components/ui/empty-state";
import { SkeletonCards } from "~/components/ui/skeleton";
import { SkeletonCardService } from "~/components/organization/skeleton-card-image";
import CatalogServiceCard from "./catalog-service-card";
import { getServicesByOrganizationId } from "~/server/actions/services/get-services";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { Pagination as PaginationType } from "~/lib/pagination";
import { Service } from "~/lib/services.types";
import { useDataPagination } from "~/hooks/use-data-pagination";
import { useTableConfigs } from "~/(views)/hooks/use-table-configs";
import Pagination from "~/(main)/../components/ui/pagination";

interface ServiceSectionProps {
  organizationId: string;
  isPublicView?: boolean;
  logoUrl?: string;
  themeColor?: string;
  initialServices?: PaginationType.Response<Service.Relationships.Billing.BillingService>
}

function ServicesCatalog({
  organizationId,
  logoUrl,
  themeColor,
  initialServices,
}: ServiceSectionProps) {
  const { config } = useTableConfigs('table-config');

  const {
    data: services,
    isLoading,
    pagination,
  } = useDataPagination<Service.Relationships.Billing.BillingService>({
    queryKey: ['services'],
    queryFn: ({ page, limit, filters }) =>
      getServicesByOrganizationId({
        pagination: { page, limit },
        filters: filters?.searchTerm
          ? [
              {
                field: 'name',
                operator: 'ilike',
                value: filters.searchTerm,
              },
            ]
          : undefined,
      }, organizationId, true) as Promise<PaginationType.Response<Service.Relationships.Billing.BillingService>>,
    initialData: initialServices,
    config: {
      limit: config.rowsPerPage.value,
    },
  });

  // User role
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace?.role;

  const { t } = useTranslation("services");

  const validRoles = ["agency_owner", "agency_project_manager"];
  const canEditService = validRoles.includes(userRole ?? "");

  // Filter the services to only show public services - this filtering happens on the current page data
  const filteredServices = Array.isArray(services)
    ? canEditService
      ? services
      : services.filter((service) => service.visibility === "public")
    : [];

  // Create pagination config for the Pagination component
  const paginationConfig = {
    totalPages: pagination.totalPages,
    currentPage: pagination.currentPage - 1, // Convert to 0-based indexing for the component
    goToPage: (page: number) => pagination.goToPage(page + 1), // Convert back to 1-based
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,
  };

  return (
    <div className="flex h-full w-full flex-col gap-8">
      {isLoading ? (
        <SkeletonCards count={9} className="flex h-full w-full flex-wrap gap-8 max-w-7xl mx-auto">
          <SkeletonCardService className="max-w-sm w-full"/>
        </SkeletonCards>
      ) : filteredServices.length === 0 ? (
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
            {filteredServices.map((service) => (
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

      <Pagination {...paginationConfig} />
    </div>
  );
}

export default ServicesCatalog;
