"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Link2, Pen, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@kit/ui/button";
import { Switch } from "@kit/ui/switch";

import Tooltip from "~/components/ui/tooltip";
import { Service } from "~/lib/services.types";
import DeleteServiceDialog from "~/(main)/services/delete/delete-component";
import { updateService } from "~/server/actions/services/update-services";

import { TFunction } from "../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index";
import { ColumnConfigs } from "../types";
import PrefetcherLink from "../../../components/shared/prefetcher-link";

export const servicesColumns = (
  t: TFunction,
  hasPermission?: ColumnConfigs["services"]["hasPermission"],
): ColumnDef<Service.Relationships.Billing.BillingService>[] => {
  return [
    {
      accessorKey: "name",
      header: t("services:name"),
      cell: ({ row }) => (
        <PrefetcherLink
          href={`/services/update?id=${row.original.id}`}
          className="flex w-full gap-2 font-semibold"
        >
          <div className="">{row.getValue("name")}</div>
        </PrefetcherLink>
      ),
    },
    {
      accessorKey: "price",
      header: t("services:price"),
      cell: ({ row }) => (
        <PriceDisplay
          price={row.getValue("price")}
          currency={row.original.currency}
          recurrence={row.original.recurrence}
        />
      ),
    },
    {
      accessorKey: "number_of_clients",
      header: t("services:clients"),
      cell: ({ row }) => (
        <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
          {row.getValue("number_of_clients")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("services:status"),
      cell: ({ row }) => <ServiceStatus status={row.getValue("status")} />,
    },
    {
      accessorKey: "visibility",
      header: t("services:visibility"),
      cell: ({ row }) => {
        return hasPermission?.("visibility") ? (
          <VisibilityToggle service={row.original} />
        ) : null;
      },
    },
    {
      accessorKey: "created_at",
      header: () => <span>{t("services:createdAt")}</span>,
      cell: ({ row }) => <DateDisplay date={row.original.created_at} />,
    },
    {
      id: "actions",
      header: t("services:actions"),
      cell: ({ row }) => {
        return (
          <ServiceActions
            service={row.original}
            hasPermission={hasPermission}
          />
        );
      },
    },
  ];
};

// Separate components for better organization
const PriceDisplay = ({
  price,
  currency,
  recurrence,
}: {
  price: number;
  currency: string;
  recurrence: string | null;
}) => (
  <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
    ${price} {currency.toUpperCase()} {recurrence ? ` / ${recurrence}` : ""}
  </div>
);

const VisibilityToggle = ({
  service,
}: {
  service: Service.Relationships.Billing.BillingService;
}) => {
  const { t } = useTranslation("services");
  
  // Local state for optimistic updates
  const [optimisticVisibility, setOptimisticVisibility] = useState(service.visibility);

  // Sync local state when service prop changes
  useEffect(() => {
    setOptimisticVisibility(service.visibility);
  }, [service.visibility]);

  const updateServiceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: Service.Type["id"];
      data: Service.Update;
    }) => await updateService(id, data),
    onMutate: (variables) => {
      // Optimistically update the local state immediately
      setOptimisticVisibility(variables.data.visibility as "public" | "private");
    },
    onSuccess: () => {
      // No toast notification to match the card actions pattern
      // No invalidateQueries needed - optimistic updates handle the state
    },
    onError: () => {
      // Revert optimistic update on error
      setOptimisticVisibility(service.visibility);
      console.error("Error updating service");
    },
  });

  const handleVisibilityToggle = () => {
    const newVisibility =
      optimisticVisibility === "public" ? "private" : "public";
    updateServiceMutation.mutate({
      id: service.id,
      data: { visibility: newVisibility },
    });
  };

  return (
    <Tooltip
      content={
        optimisticVisibility === "public"
          ? t("catalog.card.hide")
          : t("catalog.card.show")
      }
    >
      <div className="flex items-center">
        <Switch
          checked={optimisticVisibility === "public"}
          onCheckedChange={handleVisibilityToggle}
          disabled={updateServiceMutation.isPending}
        />
      </div>
    </Tooltip>
  );
};

const ServiceStatus = ({ status }: { status: string }) => {
  const { t } = useTranslation("services");
  const statusColors = {
    active: {
      background: "bg-[#ECFDF3]",
      text: "text-[#067647]",
      border: "border-[#ABEFC6]",
    },
    draft: {
      background: "bg-[#FEDF89]",
      text: "text-[#92400E]",
      border: "border-[#92400E]",
    },
  } as const;

  const displayStatus =
    status === "active"
      ? t("active")
      : status === "draft"
        ? t("draft")
        : status;

  // Add fallback styles if status is not in statusColors
  const styles = statusColors[status as keyof typeof statusColors] ?? {
    background: "bg-transparent",
    text: "text-black",
  };

  return (
    <div
      className={`${styles.background} ${styles.text} py-1 px-2 rounded-full text-xs border w-fit font-semibold ${styles.border}`}
    >
      {displayStatus}
    </div>
  );
};

const DateDisplay = ({ date }: { date: string }) => {
  const formattedDate = new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
  );
};

interface ServiceActionsProps {
  service: Service.Relationships.Billing.BillingService;
  hasPermission?: ColumnConfigs["services"]["hasPermission"];
}

function ServiceActions({ service, hasPermission }: ServiceActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyCheckoutUrl = () => {
    void navigator.clipboard.writeText(service.checkout_url ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 self-stretch">
      {hasPermission && hasPermission("checkout") && service.checkout_url && (
        <Tooltip
          content={
            copied ? t("services:checkoutURLCopied") : t("services:checkoutURL")
          }
        >
          <Button
            variant="ghost"
            className="cursor-pointer p-2"
            onClick={handleCopyCheckoutUrl}
          >
            {copied ? (
              <Check className="h-[20px] w-[20px] cursor-pointer text-gray-600" />
            ) : (
              <Link2 className="h-[20px] w-[20px] cursor-pointer text-gray-600" />
            )}
          </Button>
        </Tooltip>
      )}

      {hasPermission && hasPermission("edit") && (
        <Tooltip content={t("services:edit")}>
          <PrefetcherLink
            href={`/services/update?id=${service.id}`}
            className="rounded-md p-2 hover:bg-accent"
          >
            <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
          </PrefetcherLink>
        </Tooltip>
      )}
      {hasPermission && hasPermission("delete") && (
        <DeleteServiceDialog serviceId={service.id} />
      )}
    </div>
  );
}
