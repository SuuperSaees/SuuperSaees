"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { CreditOperations } from "~/lib/credit.types";
import { ColumnConfigs } from "../types";
import { CreditIcon } from "~/components/icons/icons";
// Define the type for a credit operation row
export type CreditOperation = CreditOperations.Response & {
  service?: string;
};

export const creditOperationsColumns = (
  t: (key: string) => string,
  _hasPermission?: ColumnConfigs["creditsOperations"]["hasPermission"],
): ColumnDef<CreditOperation>[] => [
  {
    accessorKey: "service",
    header: t("credits:table.columns.service"),
    cell: ({ row }) => (
      <span className="text-sm font-normal text-gray-600">
        {row.original.service ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "credits",
    header: t("credits:table.columns.credits"),
    cell: ({ row }) => {
      return (
        <span className="text-sm font-normal text-gray-600 inline-flex items-center gap-2">
          <CreditIcon className="w-4 h-4" />
          {row.original.quantity}
        </span>
      );
    },
  },
  {
    accessorKey: "remaining",
    header: t("credits:table.columns.remaining"),
    cell: ({ row }) => (
      <span className="text-sm font-normal text-gray-600 inline-flex items-center gap-2">
        <CreditIcon className="w-4 h-4" />
        {row.original.remaining}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: t("credits:table.columns.description"),
    cell: ({ row }) => (
      <span
        className="text-sm font-normal text-gray-600"
        dangerouslySetInnerHTML={{ __html: row.original.description ?? "" }}
      />
    ),
  },
  {
    accessorKey: "status",
    header: t("credits:table.columns.status"),
    cell: ({ row }) => <CreditStatusTag status={row.original.status} t={t} />,
  },
  {
    accessorKey: "date",
    header: t("credits:table.columns.date"),
    cell: ({ row }) => {
      const date = row.original.created_at
        ? formatDate(row.original?.created_at, "PP")
        : "-";

      return <span className="text-sm font-normal text-gray-600">{date}</span>;
    },
  },
];

const CreditStatusTag = ({
  status,
  t,
}: {
  status: keyof typeof creditStatusColors;
  t: (key: string) => string;
}) => {
  return (
    <div className={`${creditStatusColors[status]} w-fit rounded-sm px-2 py-1`}>
      <span className={`text-xs font-medium `}>
        {t(`credits:statuses.${status}`)}
      </span>
    </div>
  );
};
export const creditStatusColors = {
  consumed: "bg-red-100 text-red-500",
  purchased: "bg-blue-100 text-blue-500",
  expired: "bg-gray-100 text-gray-500",
  locked: "bg-gray-100 text-gray-500",
  refunded: "bg-gray-100 text-gray-500",
};
