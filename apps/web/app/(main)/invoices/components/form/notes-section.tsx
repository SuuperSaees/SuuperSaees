import React from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kit/ui/form";
import { Textarea } from "@kit/ui/textarea";
import { InvoiceFormData } from "../../schemas/schema";
import { Trans } from "@kit/ui/trans";

interface InvoiceNotesSectionProps {
  control: Control<InvoiceFormData>;
}

export function InvoiceNotesSection({ control }: InvoiceNotesSectionProps) {
  return (
    <fieldset className="px-3 py-4 text-gray-600">
      <legend className="sr-only">
        <Trans i18nKey="invoices:creation.form.notes.title" />
      </legend>
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="invoices:creation.form.notes.title" />
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write a note..."
                className="min-h-[100px] border-none focus:outline-none focus-visible:ring-0 shadow-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
}
