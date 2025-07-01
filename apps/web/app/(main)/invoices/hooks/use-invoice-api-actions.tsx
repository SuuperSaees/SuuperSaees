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
    clientOrganizationId: string,
    isDraft: boolean, 
    invoice?: Invoice.Response,
    agencybillingInfo?: InvoiceSettings | null,
    clientbillingInfo?: InvoiceSettings | null
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

    const invoiceSettings = []
    // Build agency invoice settings
    const agencyinvoiceSettings = agencybillingInfo?.information ? {
      invoice_id: "",
      organization_id: agencyId,
      address_1: agencybillingInfo.information.address_1,
      address_2: agencybillingInfo.information.address_2,
      city: agencybillingInfo.information.city,
      country: agencybillingInfo.information.country,
      postal_code: agencybillingInfo.information.postal_code,
      state: agencybillingInfo.information.state,
      name: agencybillingInfo.information.company_name || "",
      tax_id_type: agencybillingInfo.information.tax_id_type,
      tax_id_number: agencybillingInfo.information.tax_id_number,
    } : null;

    // Build client invoice settings
    const clientinvoiceSettings = clientbillingInfo?.information ? {
      invoice_id: "",
      organization_id: clientOrganizationId,
      address_1: clientbillingInfo.information.address_1,
      address_2: clientbillingInfo.information.address_2,
      city: clientbillingInfo.information.city,
      country: clientbillingInfo.information.country,
      postal_code: clientbillingInfo.information.postal_code,
      state: clientbillingInfo.information.state,
      name: clientbillingInfo.information.company_name || "",
      tax_id_type: clientbillingInfo.information.tax_id_type,
      tax_id_number: clientbillingInfo.information.tax_id_number,
    } : null;

    if (agencyinvoiceSettings) {
      invoiceSettings.push(agencyinvoiceSettings)
    }
    if (clientinvoiceSettings) {
      invoiceSettings.push(clientinvoiceSettings)
    }

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