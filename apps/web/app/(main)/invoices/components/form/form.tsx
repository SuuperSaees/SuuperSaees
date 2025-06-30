"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@kit/ui/button";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { Form } from "@kit/ui/form";
import { invoiceSchema, InvoiceFormData } from "../../schemas/schema";
import { InvoiceInformationSection } from "./information-section";
import { InvoiceItemsSection } from "./items-section";
import { InvoiceNotesSection } from "./notes-section";
import { Trans } from "@kit/ui/trans";
import { Service } from "~/lib/services.types";
import { Client } from "~/lib/client.types";
import { Invoice } from "~/lib/invoice.types";
import { Spinner } from "@kit/ui/spinner";
import { useInvoiceApiActions } from "../../hooks/use-invoice-api-actions";
import { sendEmail } from "~/server/services/send-email.service";
import { EMAIL } from "~/server/services/email.types";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { useOrganizationSettings } from "../../../../../../../packages/features/accounts/src/context/organization-settings-context";
import { parseInvoiceSettings } from "~/server/actions/invoices/type-guards";

interface InvoiceFormProps {
  clients: Client.Response[];
  services: Service.Relationships.Billing.BillingService[];
  agencyId: string;
  invoice?: Invoice.Response;
  mode: "create" | "update";
}

export function InvoiceForm({
  clients,
  services,
  agencyId,
  invoice,
  mode,
}: InvoiceFormProps) {
  const [isDraft, setIsDraft] = React.useState(false);
  const { workspace: userWorkspace, organization } = useUserWorkspace();
  const { billing_details } = useOrganizationSettings();
  const userId = userWorkspace?.id ?? "";

  const isUpdate = mode === "update";
  const { invoiceMutation, draftMutation, buildInvoicePayload } =
    useInvoiceApiActions({ mode });

  // Parse billing details to get invoice settings
  const billingInfo = parseInvoiceSettings(billing_details);

  // Transform invoice data for form
  const transformInvoiceToFormData = (
    invoice: Invoice.Response,
  ): InvoiceFormData => {
    return {
      clientId: invoice.client?.id ?? "",
      dateOfIssue: new Date(invoice.issue_date),
      paymentMethod: "", // Set default since it's not in the response type
      paymentReference: "", // Set default since it's not in the response type
      lineItems: invoice.invoice_items?.map((item) => ({
        serviceId: item.service_id ?? 0,
        description: item.description ?? "",
        rate: item.unit_price ?? 0,
        quantity: item.quantity ?? 1,
      })) ?? [{ description: "", rate: 0, quantity: 1, serviceId: 0 }],
      notes: invoice.notes ?? "",
    };
  };

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues:
      isUpdate && invoice
        ? transformInvoiceToFormData(invoice)
        : {
            clientId: "",
            dateOfIssue: new Date(),
            paymentMethod: "",
            paymentReference: "",
            lineItems: [
              { description: "", rate: 0, quantity: 1, serviceId: 0 },
            ],
            notes: billingInfo?.invoices.note.enabled
              ? billingInfo?.invoices.note.content
              : "",
          },
    mode: "onBlur",
  });

  const onSubmit = async (data: InvoiceFormData) => {
    const invoiceData = buildInvoicePayload(
      data,
      agencyId,
      isDraft,
      invoice,
      billingInfo,
    );

    if (isDraft) {
      await draftMutation.mutateAsync(invoiceData);
    } else {
      const invoice = await invoiceMutation.mutateAsync(invoiceData);
      const client = clients.find(
        (client) =>
          client.organization_client_id === invoiceData.client_organization_id,
      );
      const agencyName = organization?.name ?? "";

      void sendEmail(EMAIL.INVOICES.REQUEST_PAYMENT, {
        to: client?.user?.email ?? "", // TODO: Use invoice.client.email when available
        userId: userId,
        invoiceNumber: invoice.number,
        clientName: client?.user?.name ?? "",
        amount: "$" + (invoice.total_amount ?? 0),
        buttonUrl: invoice.checkout_url ?? undefined,
        agencyName,
      }).catch((error) => {
        console.error("Failed to send invoice request payment email:", error);
      });
    }

    // Reset draft state after submission
    setIsDraft(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-1 relative h-full flex flex-col"
      >
        <div className="flex-1 space-y-2">
          <InvoiceInformationSection control={form.control} clients={clients} />

          <InvoiceItemsSection
            control={form.control}
            setValue={form.setValue}
            services={services}
          />

          <InvoiceNotesSection control={form.control} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 w-full py-8 bg-white">
          {/* Only show "Save as Draft" button in create mode */}
          {!isUpdate && (
            <Button
              type="submit"
              variant="outline"
              onClick={() => setIsDraft(true)}
              className="flex items-center gap-2"
            >
              <Trans
                i18nKey={`invoices:${mode === "create" ? "creation" : "update"}.form.actions.saveAsDraft`}
              />
              {draftMutation.isPending ? <Spinner className="w-4 h-4" /> : null}
            </Button>
          )}
          <ThemedButton
            type="submit"
            onClick={() => setIsDraft(false)}
            className="flex items-center gap-2"
          >
            <Trans
              i18nKey={`invoices:${mode === "create" ? "creation" : "update"}.form.actions.${isUpdate ? "updateInvoice" : "createInvoice"}`}
            />
            {invoiceMutation.isPending ? <Spinner className="w-4 h-4" /> : null}
          </ThemedButton>
        </div>
      </form>
    </Form>
  );
}
