"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { CreditOperations } from "~/lib/credit.types";
import { ColumnConfigs } from "../types";
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
        <span className="text-sm font-normal text-gray-600">
        {row.original.quantity}
      </span>
      )
    }
  },
  {
    accessorKey: "remaining",
    header: t("credits:table.columns.remaining"),
    cell: ({ row }) => (
      <span className="text-sm font-normal text-gray-600">
        {row.original.status === CreditOperations.Enums.Status.PURCHASED? row.original.quantity : "-"}
      </span>
    ),
  },
  {
    accessorKey: "details",
    header: t("credits:table.columns.details"),
    cell: ({ row }) => (
      <span className="text-sm font-normal text-gray-600">
        {t(`credits:statuses.${row.original.status}`)}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: t("credits:table.columns.date"),
    cell: ({ row }) => {
      const date = row.original.created_at
        ? formatDate(row.original?.created_at, 'PP')
        : "-";

      return (
        <span className="text-sm font-medium text-gray-900">{date}</span>
      );
    },
  },
];
