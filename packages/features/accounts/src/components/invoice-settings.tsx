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
import { OrganizationSettingKeys } from "../context/organization-settings-context";
import {
  parseInvoiceSettings,
  getDefaultInvoiceSettings,
  mergeWithDefaults,
} from "../../../../../apps/web/app/server/actions/invoices/type-guards";
import { Textarea } from "@kit/ui/textarea";
import { getCountries } from "../../../../../apps/web/lib/countries";
import { canAccessInvoiceSection, UserRole } from "../utils/role-permissions";
import { useUserWorkspace } from "../hooks/use-user-workspace";
import { handleResponse } from "../../../../../apps/web/lib/response/handle-response";
import { upsertOrganizationSettings } from "../../../team-accounts/src/server/actions/organizations/update/update-organizations";
import { useMutation } from "@tanstack/react-query";

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

interface InvoiceSettingsProps {
  role: string;
}

interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showSeparator?: boolean;
}

interface FormFieldProps {
  name: string;
  label: string;
  description: string;
  placeholder: string;
  onFieldChange: (path: FormPath, value: string) => void;
  type?: "input" | "select" | "textarea" | "combobox";
  options?: Array<{ value: string; label: string }>;
  comboboxProps?: {
    searchPlaceholder: string;
    emptyMessage: string;
  };
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}
function InvoiceSettings({ role }: InvoiceSettingsProps) {
  const { t } = useTranslation("invoices");

  const updateOrganizationSetting = useMutation({
    mutationFn: async (organizationSetting: {
      key: OrganizationSettingKeys;
      value: string;
    }) => {
      const rest = await upsertOrganizationSettings(organizationSetting);
      await handleResponse(rest, "organizations", t);
      if (rest.ok && rest.success?.data) {
        return rest.success.data;
      }
      throw new Error("Failed to update organization setting");
    },
  });

  const { organization } = useUserWorkspace();
  const billing_details = organization?.settings.billing;
  const userRole = role as UserRole;

  // Get all countries using the utility function
  const countries = getCountries();

  // Safely parse billing_details with fallback to defaults using type guards
  const getInitialValues = (): InvoiceSettingsType => {
    const parsed = parseInvoiceSettings(JSON.stringify(billing_details));
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

  const taxIdOptions = [
    { value: "EIN", label: "EIN (Employer Identification Number)" },
    { value: "VAT", label: "VAT (Value Added Tax)" },
    { value: "GST", label: "GST (Goods and Services Tax)" },
    { value: "TIN", label: "TIN (Tax Identification Number)" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <div className="mt-4 w-full max-w-full md:pr-48 pr-0 pb-32 space-y-8">
      <Form {...form}>
        {/* Automatic Invoice Note Toggle - Agency Owner Only */}
        {canAccessInvoiceSection(userRole, "automatic_note") && (
          <>
            <SwitchSetting
              title={t("settings.automaticInvoiceNote.title")}
              description={t("settings.automaticInvoiceNote.description")}
              checked={form.getValues("invoices.note.enabled")}
              onCheckedChange={(checked) =>
                handleSwitchChange("invoices.note.enabled", checked)
              }
            />

            {/* Note Content */}
            {form.getValues("invoices.note.enabled") && (
              <div className="space-y-2 p-4 md:p-6 bg-gray-50 rounded-lg">
                <FormFieldComponent
                  name="invoices.note.content"
                  label={t("settings.noteContent.title")}
                  description={t("settings.noteContent.description")}
                  placeholder={t("settings.noteContent.placeholder")}
                  onFieldChange={handleFieldChange}
                  type="textarea"
                />
              </div>
            )}
            <Separator />
          </>
        )}

        {/* Billing Information Section Header */}
        {canAccessInvoiceSection(userRole, "billing_information") && (
          <div className="flex flex-col gap-2 md:p-0 p-4">
            <label className="text-sm font-bold text-gray-900 break-words">
              {t("settings.billingInformation.title")}
            </label>
            <p className="text-sm text-gray-600 break-words">
              {t("settings.billingInformation.description")}
            </p>
          </div>
        )}

        {/* Company Information Group */}
        {canAccessInvoiceSection(userRole, "company_information") && (
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-6">
            <SectionHeader
              title={t("settings.billingInformation.companyInformation.title")}
              subtitle={t(
                "settings.billingInformation.companyInformation.subtitle",
              )}
            />

            <FormFieldComponent
              name="information.company_name"
              label={t(
                "settings.billingInformation.companyInformation.companyName.label",
              )}
              description={t(
                "settings.billingInformation.companyInformation.companyName.description",
              )}
              placeholder={t(
                "settings.billingInformation.companyInformation.companyName.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />

            <FormFieldComponent
              name="information.tax_id_type"
              label={t(
                "settings.billingInformation.companyInformation.taxType.label",
              )}
              description={t(
                "settings.billingInformation.companyInformation.taxType.description",
              )}
              placeholder="Select tax ID type"
              onFieldChange={handleFieldChange}
              type="select"
              options={taxIdOptions}
            />

            <FormFieldComponent
              name="information.tax_id_number"
              label={t(
                "settings.billingInformation.companyInformation.taxId.label",
              )}
              description={t(
                "settings.billingInformation.companyInformation.taxId.description",
              )}
              placeholder={t(
                "settings.billingInformation.companyInformation.taxId.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />

            <FormFieldComponent
              name="information.country"
              label={t(
                "settings.billingInformation.companyInformation.country.label",
              )}
              description={t(
                "settings.billingInformation.companyInformation.country.description",
              )}
              placeholder={t(
                "settings.billingInformation.companyInformation.country.placeholder",
              )}
              onFieldChange={handleFieldChange}
              type="combobox"
              options={countries}
              comboboxProps={{
                searchPlaceholder: t(
                  "settings.billingInformation.companyInformation.country.searchPlaceholder",
                ),
                emptyMessage: t(
                  "settings.billingInformation.companyInformation.country.emptyMessage",
                ),
              }}
            />
          </div>
        )}

        {/* Business Address Group */}
        {canAccessInvoiceSection(userRole, "business_address") && (
          <div className="bg-gray-50 rounded-lg p-4 md:p-6 space-y-6">
            <SectionHeader
              title={t("settings.billingInformation.businessAddress.title")}
              subtitle={t(
                "settings.billingInformation.businessAddress.subtitle",
              )}
            />

            <FormFieldComponent
              name="information.address_1"
              label={t(
                "settings.billingInformation.businessAddress.streetAddress.label",
              )}
              description={t(
                "settings.billingInformation.businessAddress.streetAddress.description",
              )}
              placeholder={t(
                "settings.billingInformation.businessAddress.streetAddress.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />

            <FormFieldComponent
              name="information.address_2"
              label={t(
                "settings.billingInformation.businessAddress.addressLine2.label",
              )}
              description={t(
                "settings.billingInformation.businessAddress.addressLine2.description",
              )}
              placeholder={t(
                "settings.billingInformation.businessAddress.addressLine2.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />

            <FormFieldComponent
              name="information.city"
              label={t(
                "settings.billingInformation.businessAddress.city.label",
              )}
              description={t(
                "settings.billingInformation.businessAddress.city.description",
              )}
              placeholder={t(
                "settings.billingInformation.businessAddress.city.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />

            <FormFieldComponent
              name="information.state"
              label={t(
                "settings.billingInformation.businessAddress.stateProvince.label",
              )}
              description={t(
                "settings.billingInformation.businessAddress.stateProvince.description",
              )}
              placeholder={t(
                "settings.billingInformation.businessAddress.stateProvince.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />

            <FormFieldComponent
              name="information.postal_code"
              label={t(
                "settings.billingInformation.businessAddress.zipCode.label",
              )}
              description={t(
                "settings.billingInformation.businessAddress.zipCode.description",
              )}
              placeholder={t(
                "settings.billingInformation.businessAddress.zipCode.placeholder",
              )}
              onFieldChange={handleFieldChange}
            />
          </div>
        )}

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
// Reusable Setting Row Component
function SettingRow({
  title,
  description,
  children,
  showSeparator = true,
}: SettingRowProps) {
  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap gap-6 justify-between md:p-0 p-4">
        <div className="md:w-[45%] w-full flex flex-col gap-2 text-gray-700">
          <label className="text-sm font-medium text-gray-900 break-words">
            {title}
          </label>
          <p className="text-sm text-gray-600 break-words">{description}</p>
        </div>
        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
      {showSeparator && <Separator />}
    </>
  );
}

// Reusable Form Field Component
function FormFieldComponent({
  name,
  label,
  description,
  placeholder,
  onFieldChange,
  type = "input",
  options = [],
  comboboxProps,
}: FormFieldProps) {
  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <Select
            onValueChange={(value) => onFieldChange(name as FormPath, value)}
          >
            <SelectTrigger className="text-gray-700">
              <SelectValue
                className="text-gray-700"
                placeholder={placeholder}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            className="min-h-[100px] resize-none text-gray-700"
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
              onFieldChange(name as FormPath, e.target.value)
            }
          />
        );

      case "combobox":
        return (
          <Combobox
            options={options}
            onValueChange={(value) => onFieldChange(name as FormPath, value)}
            placeholder={placeholder}
            searchPlaceholder={comboboxProps?.searchPlaceholder ?? ""}
            emptyMessage={comboboxProps?.emptyMessage ?? ""}
            contentClassName="text-gray-700"
            triggerClassName="text-gray-700"
            className="w-full text-gray-700 bg-transparent font-normal"
          />
        );

      default:
        return (
          <ThemedInput
            placeholder={placeholder}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
              onFieldChange(name as FormPath, e.target.value)
            }
            className="text-gray-700"
          />
        );
    }
  };

  return (
    <SettingRow title={label} description={description}>
      <FormField
        name={name}
        render={({ field: _field }) => (
          <FormItem>
            <FormControl>{renderField()}</FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </SettingRow>
  );
}

// Reusable Section Header Component
function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-3">
      <h4 className="text-sm font-semibold text-gray-900 break-words">
        {title}
      </h4>
      <p className="text-xs text-gray-500 break-words">{subtitle}</p>
    </div>
  );
}

// Reusable Switch Setting Component
function SwitchSetting({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex md:flex-nowrap gap-6 justify-between md:p-0 p-4">
        <div className="md:w-[45%] w-full flex flex-col gap-2 text-gray-700">
          <label className="text-sm font-bold text-gray-900 break-words">
            {title}
          </label>
          <p className="text-sm text-gray-600 break-words">{description}</p>
        </div>
        <div className="flex-1 flex justify-end">
          <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
      </div>
    </div>
  );
}

export default InvoiceSettings;
