"use client";

import { useState, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Download,
  MoreHorizontal,
  Check,
  Link2,
  Trash2,
  Mail,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@kit/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kit/ui/dropdown-menu";

import { Invoice } from "~/lib/invoice.types";

import { TFunction } from "../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index";
import { ColumnConfigs } from "../types";
import PrefetcherLink from "../../../components/shared/prefetcher-link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteInvoice,
  updateInvoice,
} from "~/server/actions/invoices/invoices.action";
import { toast } from "sonner";
import { sendEmail } from "~/server/services/send-email.service";
import { EMAIL } from "~/server/services/email.types";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { useInvoicePDF } from "../../../hooks/use-invoice-pdf";
import { PDFPreviewDialog } from "../../pdf/pdf-preview-dialog";

export const invoicesColumns = (
  t: TFunction,
  hasPermission?: ColumnConfigs["invoices"]["hasPermission"],
): ColumnDef<Invoice.Response>[] => {
  return [
    {
      accessorKey: "number",
      header: t("invoices:number"),
      cell: ({ row }) => (
        <PrefetcherLink
          href={`/invoices/${row.original.id}`}
          className="flex w-full gap-2 font-semibold"
        >
          {row.getValue("number")}
        </PrefetcherLink>
      ),
    },
    {
      accessorKey: "client",
      header: t("invoices:organization"),
      cell: ({ row }) => (
        <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
          {row.original.client?.name ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "payment_method",
      header: t("invoices:paymentMethod"),
      cell: ({ row }) => {
        const paymentMethod: string =
          row.original?.invoice_payments?.[0]?.payment_method ?? "-";
        // returns => bank_account = > Bank account, manual => Manual
        const formattedPaymentMethod = paymentMethod
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char: string) => char.toUpperCase());
        return <PaymentMethodDisplay paymentMethod={formattedPaymentMethod} />;
      },
    },
    {
      accessorKey: "status",
      header: t("invoices:status"),
      cell: ({ row }) => <InvoiceStatus status={row.getValue("status")} />,
    },
    {
      accessorKey: "created_at",
      header: () => <span>{t("invoices:createdAt")}</span>,
      cell: ({ row }) => <DateDisplay date={row.original.created_at} />,
    },
    {
      id: "actions",
      header: t("invoices:actions"),
      cell: ({ row }) => {
        return (
          <InvoiceActions
            invoice={row.original}
            hasPermission={hasPermission}
          />
        );
      },
    },
  ];
};

// Separate components for better organization
const PaymentMethodDisplay = ({ paymentMethod }: { paymentMethod: string }) => (
  <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
    {paymentMethod}
  </div>
);

const InvoiceStatus = ({ status }: { status: string }) => {
  const { t } = useTranslation("invoices");
  const statusColors = {
    paid: {
      background: "bg-green-100",
      text: "text-green-600",
      border: "border-green-600",
    },
    issued: {
      background: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-600",
    },
    partially_paid: {
      background: "bg-yellow-100",
      text: "text-yellow-600",
      border: "border-yellow-600",
    },
    draft: {
      background: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-600",
    },
    overdue: {
      background: "bg-red-100",
      text: "text-red-600",
      border: "border-red-600",
    },
    cancelled: {
      background: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-600",
    },
    voided: {
      background: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-600",
    },
  } as const;

  const displayStatus =
    status === "paid"
      ? t("paid")
      : status === "issued"
        ? t("issued")
        : status === "partially_paid"
          ? t("partiallyPaid")
          : status === "draft"
            ? t("draft")
            : status === "overdue"
              ? t("overdue")
              : status === "cancelled"
                ? t("cancelled")
                : status === "voided"
                  ? t("voided")
                  : status;

  // Add fallback styles if status is not in statusColors
  const styles = statusColors[status as keyof typeof statusColors] ?? {
    background: "bg-transparent",
    text: "text-black",
    border: "border-gray-300",
  };

  return (
    <div
      className={`${styles.background} ${styles.text} py-1 px-2 rounded-sm text-xs w-fit font-semibold `}
    >
      {displayStatus}
    </div>
  );
};

const DateDisplay = ({ date }: { date: string | null }) => {
  if (!date)
    return <span className="text-sm font-medium text-gray-900">-</span>;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
  );
};

interface InvoiceActionsProps {
  invoice: Invoice.Response;
  hasPermission?: ColumnConfigs["invoices"]["hasPermission"];
}

function InvoiceActions({ invoice, hasPermission }: InvoiceActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string>("");
  const queryClient = useQueryClient();
  const { workspace: userWorkspace } = useUserWorkspace();
  const userId = userWorkspace?.id ?? "";
  const { downloadInvoicePDF, previewInvoicePDF } = useInvoicePDF();

  const handleCopyPaymentUrl = () => {
    void navigator.clipboard.writeText(invoice.checkout_url ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = useCallback(async () => {
    try {
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  }, [downloadInvoicePDF, invoice]);

  const handlePreview = useCallback(async () => {
    try {
      const pdfUrl = await previewInvoicePDF(invoice);
      setPreviewPdfUrl(pdfUrl);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to preview PDF:", error);
    }
  }, [previewInvoicePDF, invoice]);

  const updateStatusInvoiceMutation = useMutation({
    mutationFn: (invoice: Invoice.Response) =>
      updateInvoice({
        id: invoice.id,
        status: "paid",
      }),
    onMutate: () => {
      toast.loading(t("responses:loading.title"), {
        description: t("invoices:loading.updatingInvoiceStatus"),
      });
    },
    onSuccess: () => {
      toast.success(t("responses:success.title"), {
        description: t("invoices:success.invoiceUpdated"),
      });
      toast.dismiss();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      toast.error(t("responses:error.title"), {
        description: t("invoices:errors.failedToUpdateInvoice"),
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoice: Invoice.Response) => deleteInvoice(invoice.id),
    onMutate: () => {
      toast.loading(t("responses:loading.title"), {
        description: t("invoices:loading.deletingInvoice"),
      });
    },
    onSuccess: () => {
      toast.success(t("responses:success.title"), {
        description: t("invoices:success.invoiceDeleted"),
      });
      toast.dismiss();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      toast.error(t("responses:error.title"), {
        description: t("invoices:errors.failedToDeleteInvoice"),
      });
    },
  });

  const sendEmailInvoiceMutation = useMutation({
    mutationFn: async (invoice: Invoice.Response) => {
      try {
        // For now, use a placeholder email until client email field is available
        const result = await sendEmail(EMAIL.INVOICES.REQUEST_PAYMENT, {
          to: invoice?.client?.owner?.email ?? "", // TODO: Use invoice.client.email when available
          userId: userId,
          invoiceNumber: invoice.number,
          clientName: invoice.client?.owner?.name ?? "",
          amount: "$" + (invoice.total_amount ?? 0),
          buttonUrl: invoice.checkout_url ?? undefined,
          agencyName: invoice.agency?.name ?? "",
        });

        return result;
      } catch (error) {
        console.error("DEBUG - Error in email call:", error);
        throw error;
      }
    },
    onMutate: () => {
      toast.loading(t("responses:loading.title"), {
        description: t("invoices:loading.sendingEmail"),
      });
    },
    onSuccess: () => {
      toast.success(t("responses:success.title"), {
        description: t("invoices:success.emailSent"),
      });
    },
    onError: () => {
      toast.error(t("responses:error.title"), {
        description: t("invoices:errors.failedToSendEmail"),
      });
    },
    onSettled: () => {
      toast.dismiss();
    },
  });

  const handleMarkAsPaid = () => {
    updateStatusInvoiceMutation.mutate(invoice);
  };

  const handleRequestPayment = () => {
    if (!userId) {
      toast.error("User workspace not found");
      return;
    }

    sendEmailInvoiceMutation.mutate(invoice);
  };

  const handleDelete = () => {
    deleteInvoiceMutation.mutate(invoice);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-2 p-2">
          {hasPermission && hasPermission("view") && (
            <DropdownMenuItem
              onClick={handlePreview}
              className="text-gray-600 cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>
          )}
          {hasPermission && hasPermission("download") && (
            <DropdownMenuItem
              onClick={handleDownload}
              className="text-gray-600 cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("download")}
            </DropdownMenuItem>
          )}
          {hasPermission &&
            hasPermission("markAsPaid") &&
            invoice.status !== "paid" && (
              <DropdownMenuItem
                onClick={handleMarkAsPaid}
                className="text-gray-600 cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                {t("markAsPaid")}
              </DropdownMenuItem>
            )}

          {hasPermission && hasPermission("requestPayment") && (
            <DropdownMenuItem
              onClick={handleRequestPayment}
              className="text-gray-600 cursor-pointer"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("requestPaymentByEmail")}
            </DropdownMenuItem>
          )}

          {hasPermission &&
            hasPermission("getPaymentLink") &&
            invoice.checkout_url && (
              <DropdownMenuItem
                onClick={handleCopyPaymentUrl}
                className="text-gray-600 cursor-pointer"
              >
                <Link2 className="mr-2 h-4 w-4" />
                {copied ? t("paymentLinkCopied") : t("getPaymentLink")}
              </DropdownMenuItem>
            )}

          {hasPermission && hasPermission("delete") && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-gray-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PDFPreviewDialog
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl);
            setPreviewPdfUrl("");
          }
        }}
        pdfUrl={previewPdfUrl}
        fileName={`invoice-${invoice.number}.pdf`}
        title={`Invoice #${invoice.number}`}
      />
    </>
  );
}
