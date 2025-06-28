import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createInvoice, updateInvoice } from "~/server/actions/invoices/invoices.action";
import { Invoice } from "~/lib/invoice.types";
import { InvoiceSettings } from "~/server/actions/invoices/type-guards";

interface UseInvoiceApiActionsProps {
  mode: "create" | "update";
}

export function useInvoiceApiActions({ mode }: UseInvoiceApiActionsProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation("invoices");
  const isUpdate = mode === "update";

  const invoiceMutation = useMutation({
    mutationFn: isUpdate ? updateInvoice : createInvoice,
    onSuccess: () => {
      const successMessage = isUpdate 
        ? t("success.invoiceUpdated") 
        : t("success.invoiceCreated");
      toast.success(successMessage);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/invoices");
    },
    onError: (error) => {
      console.error("Invoice operation error:", error);
      const errorMessage = isUpdate 
        ? t("errors.failedToUpdateInvoice") 
        : t("errors.failedToCreateInvoice");
      toast.error(errorMessage);
    },
  });

  const draftMutation = useMutation({
    mutationFn: isUpdate ? updateInvoice : createInvoice,
    onSuccess: () => {
      const successMessage = isUpdate 
        ? t("success.invoiceDraftUpdated") 
        : t("success.invoiceDraftCreated");
      toast.success(successMessage);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      console.error("Draft operation error:", error);
      const errorMessage = isUpdate 
        ? t("errors.failedToUpdateInvoice") 
        : t("errors.failedToCreateInvoice");
      toast.error(errorMessage);
    },
  });

  const buildInvoicePayload = (
    data: {
      clientId: string;
      dateOfIssue: Date;
      paymentMethod?: string;
      paymentReference?: string;
      lineItems: Array<{
        serviceId: number;
        description: string;
        rate: number;
        quantity: number;
      }>;
      notes?: string;
    }, 
    agencyId: string, 
    isDraft: boolean, 
    invoice?: Invoice.Response,
    billingInfo?: InvoiceSettings | null
  ) => {
    // Calculate totals
    const subtotal = data.lineItems.reduce(
      (sum: number, item) => sum + item.rate * item.quantity,
      0,
    );
    const totalAmount = subtotal; // Add tax logic here if needed

    // Calculate due date (30 days from issue date)
    const dueDate = new Date(data.dateOfIssue);
    dueDate.setDate(dueDate.getDate() + 30);

    // Build invoice settings from billing info
    const invoiceSettings = billingInfo?.information ? [{
      invoice_id: "", // Will be set by the service
      organization_id: agencyId,
      name: billingInfo.information.company_name || "",
      address_1: billingInfo.information.address_1,
      address_2: billingInfo.information.address_2,
      country: billingInfo.information.country,
      postal_code: billingInfo.information.postal_code,
      city: billingInfo.information.city,
      state: billingInfo.information.state,
      tax_id_type: billingInfo.information.tax_id_type,
      tax_id_number: billingInfo.information.tax_id_number,
    }] : null;

    return {
      ...(isUpdate && invoice ? { id: invoice.id } : {}),
      agency_id: agencyId,
      client_organization_id: data.clientId,
      number: isUpdate ? (invoice?.number ?? "") : "", // Keep existing number for updates
      issue_date: data.dateOfIssue.toISOString()?.split("T")[0] ?? "",
      due_date: dueDate.toISOString()?.split("T")[0] ?? "",
      subtotal_amount: subtotal,
      total_amount: totalAmount,
      notes: data.notes ?? null,
      status: isDraft ? ("draft" as const) : ("issued" as const),
      invoice_items: data.lineItems.map((item) => ({
        invoice_id: isUpdate ? (invoice?.id ?? "") : "", 
        description: item.description,
        service_id: item.serviceId,
        unit_price: item.rate,
        quantity: item.quantity,
        total_price: item.rate * item.quantity,
      })),
      invoice_settings: invoiceSettings,
    };
  };

  return {
    invoiceMutation,
    draftMutation,
    buildInvoicePayload,
  };
} 