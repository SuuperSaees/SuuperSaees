"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Alert } from "../../../../../apps/web/app/components/shared/export-csv-button/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kit/ui/form";
import { Separator } from "@kit/ui/separator";
import { Switch } from "@kit/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kit/ui/select";
import { Combobox } from "../../../../../apps/web/components/ui/combobox";

import { ThemedInput } from "./ui/input-themed-with-settings";
import { useOrganizationSettings } from "../context/organization-settings-context";
import {
  parseInvoiceSettings,
  getDefaultInvoiceSettings,
  mergeWithDefaults,
} from "../../../../../apps/web/app/server/actions/invoices/type-guards";
import { Textarea } from "@kit/ui/textarea";
import { getCountries } from "../../../../../apps/web/lib/countries";

// Schema for invoice settings with improved structure
const InvoiceSettingsSchema = z.object({
  information: z.object({
    company_name: z.string(),
    address_1: z.string(),
    address_2: z.string(),
    country: z.string(),
    postal_code: z.string(),
    city: z.string(),
    state: z.string(),
    tax_id_type: z.string(),
    tax_id_number: z.string(),
  }),
  invoices: z.object({
    enabled: z.boolean(),
    require_complete_address: z.boolean(),
    note: z.object({
      enabled: z.boolean(),
      content: z.string(),
    }),
  }),
});

type InvoiceSettingsType = z.infer<typeof InvoiceSettingsSchema>;

// Note: Default values are now handled by the type guards functions

interface InvoiceSettingsProps {
  role: string;
}

function InvoiceSettings({ role: _role }: InvoiceSettingsProps) {
  const { t } = useTranslation("invoices");
  const { updateOrganizationSetting, billing_details } =
    useOrganizationSettings();

  // Get all countries using the utility function
  const countries = getCountries();

  // Safely parse billing_details with fallback to defaults using type guards
  const getInitialValues = (): InvoiceSettingsType => {
    const parsed = parseInvoiceSettings(billing_details);
    return parsed ? mergeWithDefaults(parsed) : getDefaultInvoiceSettings();
  };

  const form = useForm<InvoiceSettingsType>({
    resolver: zodResolver(InvoiceSettingsSchema),
    defaultValues: getInitialValues(),
  });

  const updateInvoiceSetting = (updatedData: Partial<InvoiceSettingsType>) => {
    const currentValues = form.getValues();
    const newValues = { ...currentValues, ...updatedData };

    updateOrganizationSetting.mutate({
      key: "billing_details",
      value: JSON.stringify(newValues),
    });
  };

  type FormPath =
    | "invoices.enabled"
    | "invoices.require_complete_address"
    | "invoices.note.enabled"
    | "information.company_name"
    | "information.address_1"
    | "information.address_2"
    | "information.country"
    | "information.postal_code"
    | "information.city"
    | "information.state"
    | "information.tax_id_type"
    | "information.tax_id_number"
    | "invoices.note.content";

  const handleSwitchChange = (path: FormPath, value: boolean) => {
    form.setValue(path, value);
    const currentValues = form.getValues();
    updateInvoiceSetting(currentValues);
  };

  const handleFieldChange = (path: FormPath, value: string) => {
    form.setValue(path, value);
    const currentValues = form.getValues();
    updateInvoiceSetting(currentValues);
  };

  return (
    <div className="mt-4 w-full max-w-full pr-48 pb-32 space-y-8">
      <Form {...form}>
        {/* Invoice Management Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t("settings.invoiceManagement.title")}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t("settings.invoiceManagement.description")}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Switch
                checked={form.getValues("invoices.enabled")}
                onCheckedChange={(checked) =>
                  handleSwitchChange("invoices.enabled", checked)
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Require Complete Address Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t("settings.requireCompleteAddress.title")}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t("settings.requireCompleteAddress.description")}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Switch
                checked={form.getValues("invoices.require_complete_address")}
                onCheckedChange={(checked) =>
                  handleSwitchChange(
                    "invoices.require_complete_address",
                    checked,
                  )
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Automatic Invoice Note Toggle */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t("settings.automaticInvoiceNote.title")}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t("settings.automaticInvoiceNote.description")}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Switch
                checked={form.getValues("invoices.note.enabled")}
                onCheckedChange={(checked) =>
                  handleSwitchChange("invoices.note.enabled", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Note Content */}
        {form.getValues("invoices.note.enabled") && (
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="w-[45%] pr-4">
                <label className="text-sm font-medium text-gray-900">
                  {t("settings.noteContent.title")}
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {t("settings.noteContent.description")}
                </p>
              </div>
              <div className="flex-1">
                <FormField
                  name="invoices.note.content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("settings.noteContent.placeholder")}
                          className="min-h-[100px] resize-none text-gray-700"
                          onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
                            handleFieldChange(
                              "invoices.note.content",
                              e.target.value,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Billing Information Section Header */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            {t("settings.billingInformation.title")}
          </label>
          <p className="text-sm text-gray-600">
            {t("settings.billingInformation.description")}
          </p>
        </div>

        {/* Company Information Group */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {t("settings.billingInformation.companyInformation.title")}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {t("settings.billingInformation.companyInformation.subtitle")}
            </p>
          </div>

          {/* Company Name */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t(
                  "settings.billingInformation.companyInformation.companyName.label",
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.companyInformation.companyName.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.companyInformation.companyName.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            "information.company_name",
                            e.target.value,
                          )
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tax ID Type */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                Tax ID Type
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Select the type of tax identification number
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.tax_id_type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleFieldChange("information.tax_id_type", value);
                        }}
                      >
                        <SelectTrigger className="text-gray-700">
                          <SelectValue
                            className="text-gray-700"
                            placeholder="Select tax ID type"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EIN">
                            EIN (Employer Identification Number)
                          </SelectItem>
                          <SelectItem value="VAT">
                            VAT (Value Added Tax)
                          </SelectItem>
                          <SelectItem value="GST">
                            GST (Goods and Services Tax)
                          </SelectItem>
                          <SelectItem value="TIN">
                            TIN (Tax Identification Number)
                          </SelectItem>
                          <SelectItem value="OTHER">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tax ID Number */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t(
                  "settings.billingInformation.companyInformation.taxId.label",
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.companyInformation.taxId.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.tax_id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.companyInformation.taxId.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            "information.tax_id_number",
                            e.target.value,
                          )
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Country */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t(
                  "settings.billingInformation.companyInformation.country.label",
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.companyInformation.country.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.country"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="w-full">
                        <Combobox
                          options={countries}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleFieldChange("information.country", value);
                          }}
                          placeholder={t(
                            "settings.billingInformation.companyInformation.country.placeholder",
                          )}
                          searchPlaceholder={t("settings.billingInformation.companyInformation.country.searchPlaceholder")}
                          emptyMessage={t("settings.billingInformation.companyInformation.country.emptyMessage")}
                          contentClassName="text-gray-700"
                          triggerClassName="text-gray-700"
                          className="w-full text-gray-700 bg-transparent font-normal"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Business Address Group */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {t("settings.billingInformation.businessAddress.title")}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {t("settings.billingInformation.businessAddress.subtitle")}
            </p>
          </div>

          {/* Street Address */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t(
                  "settings.billingInformation.businessAddress.streetAddress.label",
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.businessAddress.streetAddress.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.address_1"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.businessAddress.streetAddress.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            "information.address_1",
                            e.target.value,
                          )
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address Line 2 */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t(
                  "settings.billingInformation.businessAddress.addressLine2.label",
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.businessAddress.addressLine2.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.address_2"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.businessAddress.addressLine2.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            "information.address_2",
                            e.target.value,
                          )
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* City */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t("settings.billingInformation.businessAddress.city.label")}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.businessAddress.city.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.businessAddress.city.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange("information.city", e.target.value)
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* State/Province */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t(
                  "settings.billingInformation.businessAddress.stateProvince.label",
                )}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.businessAddress.stateProvince.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.state"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.businessAddress.stateProvince.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange("information.state", e.target.value)
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* ZIP Code */}
          <div className="flex justify-between items-start">
            <div className="w-[45%] pr-4">
              <label className="text-sm font-medium text-gray-900">
                {t("settings.billingInformation.businessAddress.zipCode.label")}
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {t(
                  "settings.billingInformation.businessAddress.zipCode.description",
                )}
              </p>
            </div>
            <div className="flex-1">
              <FormField
                name="information.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ThemedInput
                        {...field}
                        placeholder={t(
                          "settings.billingInformation.businessAddress.zipCode.placeholder",
                        )}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            "information.postal_code",
                            e.target.value,
                          )
                        }
                        className="text-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Info Alert */}
        <Alert
          title={t("settings.billingInformation.infoNote.title")}
          description={t("settings.billingInformation.infoNote.description")}
          type="info"
          visible={true}
          className="bg-blue-50 border-none"
        />
      </Form>
    </div>
  );
}

export default InvoiceSettings;
