"use client";

import type { ColumnDefBase } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";

import TableSkeleton from "~/(views)/components/table/table-skeleton";
import { useTableConfigs } from "~/(views)/hooks/use-table-configs";
import EmptyState from "~/components/ui/empty-state";
import { useColumns } from "~/hooks/use-columns";
import { useDataPagination } from "~/hooks/use-data-pagination";
import { Pagination } from "~/lib/pagination";

import AddButton from "./add-button";
import { getCredits } from "~/server/actions/credits/credits.action";
import Table from "~/(main)/../components/table/table";
import { CreditOperations } from "~/lib/credit.types";
import CreditEditionSheet from "./edition-sheet";

interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}

const CreditOperationsTable = ({
  initialData,
  queryKey = ["credits"],
  queryFn,
  creditId,
  clientOrganizationId,
  agencyId,
}: {
  initialData?: Pagination.Response<CreditOperations.Response>;
  queryKey: string[];
  queryFn?: () => Promise<Pagination.Response<CreditOperations.Response>>;
  creditId: string;
  clientOrganizationId: string;
  agencyId: string;
}) => {
  const { workspace } = useUserWorkspace();
  const accountRole = workspace?.role ?? "";
  const userId = workspace?.id ?? "";
  const { t } = useTranslation(["credits"]);
  const { config } = useTableConfigs("table-config");

  const {
    data: creditsOperations,
    isLoading: creditsOperationsAreLoading,
    pagination,
  } = useDataPagination<CreditOperations.Response>({
    queryKey,
    queryFn:
      queryFn ??
      (({ page, limit }) =>
        getCredits({
          pagination: { page, limit },
          filters: {
            client_organization_id: [clientOrganizationId],
          },
        })),
    initialData,
    config: {
      limit: 10,
    },
  });

  const hasPermissionToActionCredits = (type?: string) => {
    switch (type) {
      case "create":
        return ["agency_owner", "agency_project_manager"].includes(accountRole);
      case "delete":
        return ["agency_owner"].includes(accountRole);
      case "edit":
        return ["agency_owner"].includes(accountRole);
      case "view":
        return ["agency_owner", "agency_project_manager"].includes(accountRole);
      default:
        return false;
    }
  };

  const creditOperationsColumns = useColumns("creditsOperations", {
    hasPermission: hasPermissionToActionCredits,
  }) as ColumnDef<CreditOperations.Response>[];

  const extendedConfig = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: creditsOperationsAreLoading,
    },
  };

  if(creditsOperationsAreLoading) {
    return<TableSkeleton columns={6} rows={7} />
  }
  
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap w-fit justify-end gap-4 sm:flex-nowrap ml-auto">
        {hasPermissionToActionCredits("create") && (
          <CreditEditionSheet
            mode="create"
            creditId={creditId}
            buttonTrigger={<AddButton />}
            clientOrganizationId={clientOrganizationId}
            agencyId={agencyId}
            userId={userId}
          />
        )}
      </div>
      {creditsOperationsAreLoading ? (
        <TableSkeleton columns={6} rows={4} />
      ) : creditsOperations.length === 0 ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t("credits:empty.title")}
          description={t("credits:empty.description")}
        />
      ) : (
        <Table
          data={creditsOperations}
          columns={creditOperationsColumns}
          filterKey="status"
          configs={extendedConfig}
        />
      )}
    </div>
  );
};

export default CreditOperationsTable;
