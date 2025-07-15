"use client";

import { useMemo, useState } from "react";
import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  TableOptions,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { Button } from "@kit/ui/button";
import { DataTable } from "@kit/ui/data-table";
import { ProfileAvatar } from "@kit/ui/profile-avatar";

import { useTableConfigs } from "../../../../../../apps/web/app/(views)/hooks/use-table-configs";
import PrefetcherLink from "../../../../../../apps/web/app/components/shared/prefetcher-link";
import EmptyState from "../../../../../../apps/web/components/ui/empty-state";
import SearchInput from "../../../../../../apps/web/components/ui/search-input";
import { Client } from "../../../../../../apps/web/lib/client.types";
import { Organization } from "../../../../../../apps/web/lib/organization.types";
import { Pagination } from "../../../../../../apps/web/lib/pagination";
import type { TFunction } from "../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index";
import CreateClientDialog from "../../../../../../packages/features/team-accounts/src/server/actions/clients/create/create-client";
import AgencyClientCrudMenu from "./agency-client-crud-menu";
import { OrganizationOptionsDropdown } from "./organization-options-dropdown";
import {
  getClients,
  getOrganizations,
} from "../../../../../../apps/web/app/server/actions/clients/get-clients";
import { useDataPagination } from "../../../../../../apps/web/app/hooks/use-data-pagination";

// organization type based on getUniqueOrganizations

type ClientsTableProps = {
  initialClients: Pagination.Response<Client.Response>;
  initialOrganizations: Pagination.Response<Organization.Response>;
  agencyId: string;
  // accountIds: string[];
  // accountNames: string[];
  view?: "clients" | "organizations";
};

// CLIENTS TABLE
// accountIds, accountNames
export function ClientsTable({
  initialClients,
  initialOrganizations,
  agencyId,
  view,
}: ClientsTableProps) {
  const { t } = useTranslation();

  const [activeButton, setActiveButton] = useState<"clients" | "organizations">(
    view ?? "clients",
  );
  const { workspace } = useUserWorkspace();
  const userRole = workspace.role ?? "";
  const { config } = useTableConfigs("table-config");
  const [clientsSearchTerm, setClientsSearchTerm] = useState("");
  const [organizationsSearchTerm, setOrganizationsSearchTerm] = useState("");
  const {
    data: clients,
    isLoading: clientsAreLoading,
    pagination,
  } = useDataPagination<Client.Response>({
    queryKey: ["clients"],
    queryFn: ({ page, limit, filters }) =>
      getClients(agencyId, {
        pagination: { page, limit },
        orFilters: filters?.searchTerm
          ? [
              {
                field: "name",
                operator: "ilike",
                value: filters.searchTerm,
                referencedTable: "accounts",
              },
              {
                field: "name",
                operator: "ilike", 
                value: filters.searchTerm,
                referencedTable: "organizations",
              },
            ]
          : undefined,
      }),
    initialData: initialClients,
    config: {
      limit: config.rowsPerPage.value,
      filters: { searchTerm: clientsSearchTerm },
    },
  });

  const {
    data: organizations,
    isLoading: organizationsAreLoading,
    pagination: organizationsPagination,
  } = useDataPagination<Organization.Response>({
    queryKey: ["organizations"],
    queryFn: ({ page, limit, filters }) =>
      getOrganizations(agencyId, {
        pagination: { page, limit },
        orFilters: filters?.searchTerm
          ? [{ field: "name", operator: "ilike", value: filters.searchTerm }]
          : undefined,
      }),
    initialData: initialOrganizations,
    config: {
      limit: config.rowsPerPage.value,
      filters: { searchTerm: organizationsSearchTerm },
    },
  });


  // const filteredClients = (clients as Client.Response[])?.filter(
  //   (client: Client.Response) => {
  //     const isClientGuest =
  //       client.user?.name?.toLowerCase().includes("guest") &&
  //       client.user?.email?.toLowerCase().includes("guest") &&
  //       client.user?.email?.toLowerCase().includes("@suuper.co");
  //     return !isClientGuest;
  //   },
  // );
  const filteredClients = clients;
  const extendedConfigClients = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: clientsAreLoading,
    },
  };
  const extendedConfigOrganizations = {
    ...config,
    pagination: {
      totalCount: organizationsPagination.total,
      totalPages: organizationsPagination.totalPages,
      currentPage: organizationsPagination.currentPage,
      hasNextPage: organizationsPagination.hasNextPage,
      isOffsetBased: true,
      goToPage: organizationsPagination.goToPage,
      isLoadingMore: organizationsAreLoading,
    },
  };
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const organizationColumns = useOrganizationColumns(t);

  const filteredOrganizations = organizations ?? [];

  const clientColumns = useClientColumns(t, userRole);
  const columns =
    activeButton === "clients" ? clientColumns : organizationColumns;

  const options = {
    data:
      activeButton === "organizations"
        ? filteredOrganizations
        : filteredClients,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  };

  // const importantPropietaryOrganization = accountNames[0];
  // const importantPropietaryOrganizationId = accountIds[0];

  const handleButtonClick = React.useCallback(
    (button: "clients" | "organizations") => {
      setActiveButton(button);
    },
    [],
  );

  React.useEffect(() => {
    if (view) {
      setActiveButton(view);
      handleButtonClick(view);
    }
  }, [view, handleButtonClick]);

  const shouldShowEmptyState =
    activeButton === "clients"
      ? !filteredClients.length
      : !filteredOrganizations.length;

  const currentData =
    activeButton === "organizations" ? filteredOrganizations : filteredClients;

  const currentConfig =
    activeButton === "clients"
      ? extendedConfigClients
      : extendedConfigOrganizations;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div className="min-h-[40px] gap-2">
            {!view && (
              <>
                <Button
                  variant="ghost"
                  className={`inline-flex max-h-[32px] items-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-semibold text-[#667085] transition-all hover:text-[#667085] active:bg-[#EBECEF] ${
                    activeButton === "clients"
                      ? "bg-[#EBECEF] text-[#667085] shadow-sm data-[state=active]:bg-[#d0d6f799] data-[state=active]:text-[#667085] data-[state=active]:shadow-sm"
                      : "bg-transparent text-[#667085]"
                  } `}
                  onClick={() => handleButtonClick("clients")}
                >
                  <span className="leading-5">{t("clients:clients")}</span>
                </Button>

                <Button
                  variant="ghost"
                  className={`ml-[.5rem] inline-flex max-h-[32px] items-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-semibold text-[#667085] transition-all hover:text-[#667085] active:bg-[#EBECEF] ${
                    activeButton === "organizations"
                      ? "bg-[#EBECEF] text-[#667085] shadow-sm data-[state=active]:bg-[#d0d6f799] data-[state=active]:text-[#667085] data-[state=active]:shadow-sm"
                      : "bg-transparent text-[#667085]"
                  } `}
                  onClick={() => handleButtonClick("organizations")}
                >
                  <span className="leading-5">
                    {t("clients:organizations.title")}
                  </span>
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center justify-end gap-4">
            <SearchInput
              value={
                activeButton === "clients"
                  ? clientsSearchTerm
                  : organizationsSearchTerm
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                activeButton === "clients"
                  ? setClientsSearchTerm(e.target.value)
                  : setOrganizationsSearchTerm(e.target.value)
              }
              placeholder={
                activeButton === "clients"
                  ? t("clients:searchClients")
                  : t("clients:searchOrganizations")
              }
            />

            {((activeButton === "organizations" &&
              filteredOrganizations.length > 0) ||
              (activeButton === "clients" && filteredClients.length > 0)) && (
              <CreateClientDialog />
            )}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-white">
        {shouldShowEmptyState ? (
          <EmptyState
            imageSrc="/images/illustrations/Illustration-cloud.svg"
            title={t("startWithFirstClientTitle")}
            description={t("noClientsDescription")}
            button={<CreateClientDialog />}
          />
        ) : (
          <DataTable
            data={currentData as (Client.Response | Organization.Response)[]}
            columns={
              columns as ColumnDef<Client.Response | Organization.Response>[]
            }
            options={
              options as TableOptions<Client.Response | Organization.Response>
            }
            configs={currentConfig}
          />
        )}
      </div>
    </div>
  );
}

const useClientColumns = (
  t: TFunction<"clients", undefined>,
  userRole: string,
): ColumnDef<Client.Response>[] => {
  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("clientName"),
        cell: ({ row }) => (
          <PrefetcherLink
            href={`clients/organizations/${row.original.organization?.id}`}
            className={"flex items-center space-x-4 text-left"}
          >
            <span>
              <ProfileAvatar
                displayName={row.original?.user?.name ?? ""}
                pictureUrl={row.original?.user?.picture_url ?? ""}
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-[1.42857]">
                {row.original.user?.name}
              </span>
              <span className="text-sm font-normal leading-[1.42857] text-gray-600">
                {row.original.user?.email}
              </span>
            </div>
          </PrefetcherLink>
        ),
      },
      {
        accessorKey: "client_organization",
        header: t("organization"),
        cell: ({ row }) => (
          <PrefetcherLink
            href={`clients/organizations/${row.original.organization?.id}`}
            className="capitalize text-gray-600"
          >
            {row.original.organization?.name}
          </PrefetcherLink>
        ),
      },
      {
        accessorKey: "created_at_column",
        header: () => {
          return <span>{t("createdAt")}</span>;
        },
        cell: ({ row }) => {
          const date = new Date(row.original.user?.created_at ?? "");
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();

          const formattedDate = `${day}/${month}/${year}`;

          return <span className="text-sm text-gray-600">{formattedDate}</span>;
        },
      },
      {
        id: "actions",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => {
          const client = row.original;
          // const organizationOptions = filteredOrganizations.map(
          //   (org: Organization) => ({
          //     id: org.id,
          //     name: org.name,
          //     slug: org.slug ?? '',
          //   }),
          // );
          const organizationOptions = [
            {
              id: client.organization?.id ?? "",
              name: client.organization?.name ?? "",
              slug: client.organization?.slug ?? "",
            },
          ];
          return (
            (userRole === "agency_owner" ||
              userRole === "agency_project_manager") && (
              <div className="h-18 flex items-center gap-4 self-stretch p-4">
                {/* <UpdateClientDialog {...client} /> */}
                {/* <DeleteUserDialog userId={client.id} /> */}
                <AgencyClientCrudMenu
                  organizationOptions={organizationOptions}
                  userId={client.user_client_id}
                  name={client.user?.name ?? ""}
                  email={client.user?.email ?? ""}
                  targetRole={client.user?.role ?? undefined}
                  queryKey="clients"
                />
              </div>
            )
          );
        },
      },
    ],
    [t, userRole],
  );
};

{
  /* // ORGANIZATIONS TABLE */
}
const useOrganizationColumns = (
  t: TFunction<"clients", undefined>,
): ColumnDef<Organization.Response>[] => {
  return useMemo(
    () => [
      {
        accessorKey: "client_organization",
        header: t("organizationName"),
        cell: ({ row }) => (
          <PrefetcherLink
            href={`clients/organizations/${row.original.id}`}
            className={"flex items-center space-x-4 text-left"}
          >
            <span>
              <ProfileAvatar
                displayName={row.original.name}
                pictureUrl={row.original.picture_url}
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium font-semibold leading-[1.42857]">
                {row.original.name}
              </span>
              <span className="text-sm font-normal leading-[1.42857] text-gray-600">
                {t("leader")}: {row.original.owner?.name}
              </span>
            </div>
          </PrefetcherLink>
        ),
      },
      // {
      //   accessorKey: "members",
      //   header: t("organizationMembers"),
      //   cell: ({ row }) => (
      //     <div className="flex">
      //       <ProfileAvatar
      //         displayName={row.original.name}
      //         pictureUrl={row.original.picture_url}
      //         className="mx-0"
      //       />
      //     </div>
      //   ),
      // },
      {
        accessorKey: "created_at_organization",
        header: () => {
          return <span>{t("createdAt")}</span>;
        },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at ?? "");
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();

          const formattedDate = `${day}/${month}/${year}`;

          return <span className="text-sm text-gray-600">{formattedDate}</span>;
        },
      },
      {
        id: "actions",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div className="h-18 flex items-center gap-4 self-stretch p-4">
              <OrganizationOptionsDropdown organizationId={row.original.id} queryKey="organizations" />
            </div>
          );
        },
      },
    ],
    [t],
  );
};
