"use client";

import { useMemo } from "react";

import { ColumnDef, Row } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { z } from "zod";

import { Option } from "~/components/ui/checkbox-combobox";
import { PriorityCombobox } from "~/(main)/orders/[id]/components/priority-combobox";
import StatusCombobox from "~/(main)/orders/[id]/components/status-combobox";
import DatePicker from "~/team-accounts/src/server/actions/orders/pick-date/pick-date";

import { TFunction } from "../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index";
import Avatar from "../../../components/ui/avatar";
import { UnreadMessageIndicator } from "../../../components/ui/unread-message-indicator";
import { MultiAvatarDropdownDisplayer } from "../../../components/ui/multiavatar-displayer";
import { OverdueIndicator } from "../../../components/ui/overdue-indicator";
import { ColumnConfigs, EntityData } from "../types";
import PrefetcherLink from "../../../components/shared/prefetcher-link";
import { CreditIcon } from "~/components/icons/icons";

const truncateText = (text: string | undefined, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const ordersColumns = (
  t: TFunction,
  data: ColumnConfigs["orders"]["data"],
  actions: ColumnConfigs["orders"]["actions"],
  hasPermission?: ColumnConfigs["orders"]["hasPermission"],
): ColumnDef<EntityData["orders"][number]>[] => {
  const withPermissionsActive = hasPermission && hasPermission;

  return [
    {
      accessorKey: "title",
      header: t("orders.title"),
      cell: ({ row }) => {
        return (
          <PrefetcherLink
            href={`/orders/${row.original.id}`}
            className="flex w-full min-w-[100px] gap-2"
          >
            <div className="flex flex-col">
              <div className="flex items-center ">
                <span className="line-clamp-1 overflow-hidden truncate text-ellipsis whitespace-normal break-words font-semibold mr-2">
                  {truncateText(row.original.title)}
                </span>
                <div className="flex items-start flex-shrink-0">
                  {withPermissionsActive && hasPermission() && (
                    <OverdueIndicator
                      dueDate={row.original.due_date}
                      isCompleted={
                        row.original.status?.status_name === "completed"
                      }
                    />
                  )}
                  <UnreadMessageIndicator orderId={row.original.id} />
                </div>
              </div>
              <span className="line-clamp-1 overflow-hidden truncate text-ellipsis whitespace-normal break-words text-sm text-gray-600">
                {truncateText(row.original?.brief?.name ?? "")}
              </span>
            </div>
          </PrefetcherLink>
        );
      },
    },
    {
      accessorKey: "id",
      header: t("orders.id"),
      cell: ({ row }) => (
        <span className="text-gray-600">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: "client",
      header: t("orders.client"),
      cell: ({ row }) => {
        // const agencyLink = `/clients/organizations/${row.original.client_organization?.id}`
        // const clientLink = '/organization'
        // const isClient = withPermissionsActive && !hasPermission(row.original)
        // const isSelf = row.original.client_organization?.id === row.original.agency_id
        // const validAgencyRoles = ['agency_owner', 'agency_project_manager']
        // const link = isClient ? clientLink : isSelf ? '': agencyLink
        return (
          <span
            // href={link}
            className="flex flex-col"
          >
            <span className="line-clamp-1 overflow-hidden truncate text-ellipsis whitespace-normal break-words font-semibold">
              {truncateText(row.original.customer?.name)}
            </span>
            <span className="line-clamp-1 overflow-hidden truncate text-ellipsis whitespace-normal break-words text-sm text-gray-600">
              {truncateText(row.original.client_organization?.name ?? "")}
            </span>
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("orders.status"),
      cell: ({ row }) => {
        return (
          <StatusCombobox
            order={row.original}
            agency_id={row.original.agency_id}
            mode="order"
            blocked={withPermissionsActive && !hasPermission()}
          />
        );
      },
    },
    {
      accessorKey: "priority",
      header: t("orders.priority"),
      cell: ({ row }) => {
        return (
          <PriorityCombobox
            mode="order"
            order={row.original}
            blocked={withPermissionsActive && !hasPermission()}
          />
        );
      },
    },
    // Only include the credits column if actions.canShowCreditColumn() returns true
    ...(actions.canShowCreditColumn()
      ? [
          {
            accessorKey: "credits",
            header: t("orders.credits"),
            cell: ({ row }: { row: Row<EntityData["orders"][number]> }) => (
              <div className="flex gap-1 items-center text-gray-500">
                {row.original.credit?.quantity ?? 0}{" "}
                <CreditIcon className="w-4 h-4" />
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "assigned_to",
      header: t("orders.assignedTo"),
      cell: ({ row }) => (
        <RowAssignedTo
          row={row.original}
          blocked={(withPermissionsActive && !hasPermission()) ?? false}
          orderAgencyMembers={data.orderAgencyMembers}
          updateOrderAssigns={actions.updateOrderAssigns}
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: t("orders.createdAt"),
      cell: ({ row }) => {
        return (
          <span className="line-clamp-1 text-nowrap text-sm text-gray-500">
            {formatDate(row.original?.created_at, "PP")}
          </span>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: t("orders.updatedAt"),
      cell: ({ row }) => {
        return (
          <span className="line-clamp-1 text-nowrap text-sm text-gray-500">
            {row.original?.updated_at &&
              formatDate(row.original?.updated_at, "PP")}
          </span>
        );
      },
    },

    {
      accessorKey: "due_date",
      header: t("orders.dueDate"),
      cell: ({ row }) => {
        return (
          <DatePicker
            updateFn={async (dueDate: string) => {
              await actions.updateOrderDate.mutateAsync({
                due_date: dueDate,
                orderId: row.original.id,
              });
            }}
            defaultDate={row?.original?.due_date}
            showIcon
            blocked={withPermissionsActive && !hasPermission()}
          />
        );
      },
    },
  ];
};

const RowAssignedTo = ({
  row,
  blocked,
  orderAgencyMembers,
  updateOrderAssigns,
}: {
  row: EntityData["orders"][number];
  blocked: boolean;
  orderAgencyMembers: ColumnConfigs["orders"]["data"]["orderAgencyMembers"];
  updateOrderAssigns: ColumnConfigs["orders"]["actions"]["updateOrderAssigns"];
}) => {
  const membersAssignedSchema = z.object({
    members: z.array(z.string()),
  });

  const defaultValues = {
    members: row?.assignations
      ? row?.assignations.map((option) => option?.id)
      : [],
  };

  async function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    return await updateOrderAssigns.mutateAsync({
      agencyMemberIds: data.members,
      orderId: row.id,
    });
  }

  const searchUserOptions = useMemo(
    () =>
      orderAgencyMembers?.map((user) => ({
        picture_url: user.picture_url,
        value: user.id,
        label: user.name,
      })) ?? [],
    [orderAgencyMembers],
  );

  const avatars =
    useMemo(
      () =>
        row?.assignations?.map((assignee) => ({
          name: assignee?.name ?? "",
          email: assignee?.email ?? "",
          picture_url: assignee?.picture_url ?? "",
        })) ?? [],
      [row?.assignations],
    ) ?? [];

  const CustomUserItem = ({
    option,
  }: {
    option: Option & { picture_url?: string | null };
  }) => (
    <div className="flex items-center space-x-1">
      <Avatar
        className="font-normal"
        src={option?.picture_url ?? ""}
        username={option?.label ?? ""}
        alt={option?.label ?? ""}
      />
      <span>{option?.label}</span>
    </div>
  );
  const maxAvatars = 3;

  const CustomItemTrigger = (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-sm font-bold text-gray-600">
      +{maxAvatars >= avatars.length ? "" : avatars.length - maxAvatars}
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <MultiAvatarDropdownDisplayer
        avatars={avatars}
        displayNormal
        avatarClassName="border-white border-[0.5px]"
        maxAvatars={maxAvatars}
        options={searchUserOptions ?? []}
        onSubmit={handleFormSubmit}
        schema={membersAssignedSchema}
        defaultValues={defaultValues}
        customItem={CustomUserItem}
        customItemTrigger={CustomItemTrigger}
        blocked={blocked}
      />
    </div>
  );
};

RowAssignedTo.displayName = "RowAssignedTo";
