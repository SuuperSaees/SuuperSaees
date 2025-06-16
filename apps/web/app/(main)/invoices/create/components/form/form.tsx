"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@kit/ui/button";
import { Form } from "@kit/ui/form";
import { invoiceSchema, InvoiceFormData } from "../../schemas/schema";
import { InvoiceInformationSection } from "./information-section";
import { InvoiceItemsSection } from "./items-section";
import { InvoiceNotesSection } from "./notes-section";
import { Trans } from "@kit/ui/trans";
import { Service } from "~/lib/services.types";
import { Client } from "~/lib/client.types";
import { BaseOption } from "~/components/ui/combobox";

interface InvoiceFormProps {
  clients: Client.Response[];
  services: Service.Relationships.Billing.BillingService[];
}

export function InvoiceForm({ clients, services }: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: "",
      dateOfIssue: new Date(),
      paymentMethod: "",
      paymentReference: "",
      lineItems: [{ description: "", rate: 0, quantity: 1 }],
      notes: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: InvoiceFormData) => {
    console.log("Invoice data:", data);
    // Handle form submission
  };

  const onSaveAsDraft = () => {
    console.log("Saving as draft...");
    // Handle save as draft
  };

  const clientOptions: BaseOption[] = clients.map((client) => ({
    value: client.id,
    label: client.user?.name ?? "",
    pictureUrl: client.user?.picture_url ?? "",
  }));

  console.log("form", form.getValues());
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-1 space-y-2 relative">
        <InvoiceInformationSection
          control={form.control}
          clientOptions={clientOptions}
        />

        <InvoiceItemsSection
          control={form.control}
          setValue={form.setValue}
          services={services}
        />

        <InvoiceNotesSection control={form.control} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 w-full py-8 bg-white">
          <Button type="button" variant="outline" onClick={onSaveAsDraft}>
            <Trans i18nKey="invoices:creation.form.actions.saveAsDraft" />
          </Button>
          <Button type="submit">
            <Trans i18nKey="invoices:creation.form.actions.createInvoice" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
