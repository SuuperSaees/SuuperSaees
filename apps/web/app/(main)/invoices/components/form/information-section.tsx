import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { InvoiceFormData } from "../../schemas/schema";
import { Trans } from "@kit/ui/trans";
import { AppWindowMac, Calendar, Check, CreditCard, Users } from "lucide-react";
import { DatePicker } from "~/components/date-seletc";
import { BaseOption, Combobox } from "~/components/ui/combobox";
import Avatar from "~/(main)/../components/ui/avatar";
import { Client } from "~/lib/client.types";

interface InvoiceInformationSectionProps {
  control: Control<InvoiceFormData>;
  clients: Client.Response[];
}

const customRenderItem = (option: BaseOption, isSelected: boolean) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Avatar
        src={(option?.pictureUrl ?? "") as string}
        alt={option.label}
        username={option.label}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium truncate">
          {option.label}
        </span>
        <span className="text-xs text-gray-500 truncate text-start min-w-0">
          {(option?.organizationName ?? "" ) as string}
        </span>
      </div>

      <Check
        className={`w-4 h-4 shrink-0 ml-auto ${isSelected ? "text-primary" : "text-transparent"}`}
      />
    </div>
  );
};

const customRenderTrigger = (selectedOption: BaseOption | null) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Avatar
        src={(selectedOption?.pictureUrl ?? "") as string}
        alt={selectedOption?.label ?? ""}
        username={selectedOption?.label ?? ""}
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium truncate text-start">
          {selectedOption?.label ?? (
            <Trans i18nKey="invoices:creation.form.information.client.placeholder" />
          )}
        </span>
        <span className="text-xs text-gray-500 truncate text-start min-w-0">
          {(selectedOption?.organizationName ?? "") as string}
        </span>
      </div>
    </div>
  );
};

export function InvoiceInformationSection({
  control,
  clients,
}: InvoiceInformationSectionProps) {
  const clientOptions: BaseOption[] = clients.map((client) => ({
    value: client.user?.email ?? "",
    label: client.user?.name ?? "",
    pictureUrl: client.user?.picture_url ?? "",
    organizationName: client.organization?.name ?? "",
  }));

  return (
    <fieldset className="text-gray-600 px-3 py-4">
      <legend className="sr-only">
        <Trans i18nKey="invoices:creation.form.information.title" />
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <FormField
            control={control}
            name="clientId"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <Trans i18nKey="invoices:creation.form.information.client.label" />
                </FormLabel>

                <FormControl>
                  <Combobox
                    className="w-full"
                    options={clientOptions}
                    renderItem={customRenderItem}
                    renderTrigger={customRenderTrigger}
                    triggerClassName="border-none"
                    defaultValue={
                      clients.find(
                        (client) =>
                          client.organization_client_id === field.value,
                      )?.user?.email ?? ""
                    }
                    onValueChange={(value) => {
                      const selectedClient = clients.find(
                        (client) => client.user?.email === value,
                      );
                      if (selectedClient) {
                        field.onChange(
                          selectedClient.organization_client_id ?? "",
                        );
                      }
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={control}
            name="dateOfIssue"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <Trans i18nKey="invoices:creation.form.information.dateOfIssue.label" />
                </FormLabel>
                <FormControl>
                  <DatePicker
                    showIcon={false}
                    defaultValue={field.value}
                    onDateChange={field.onChange}
                    className="text-gray-600 border-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <Trans i18nKey="invoices:creation.form.information.paymentMethod.label" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="-"
                    {...field}
                    className="border-none focus:outline-none"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={control}
            name="paymentReference"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className="flex items-center gap-2">
                  <AppWindowMac className="w-4 h-4" />
                  <Trans i18nKey="invoices:creation.form.information.paymentReference.label" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="-"
                    {...field}
                    className="border-none focus:outline-none"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </fieldset>
  );
}
