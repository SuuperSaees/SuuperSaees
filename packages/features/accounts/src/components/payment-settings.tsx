"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@kit/ui/form";
import { Separator } from "@kit/ui/separator";
import { Switch } from "@kit/ui/switch";
import { Textarea } from "@kit/ui/textarea";

import { ThemedInput } from "./ui/input-themed-with-settings";
import { useOrganizationSettings } from "../context/organization-settings-context";

// Schema for payment settings
const PaymentSettingsSchema = z.object({
  enableManualPayments: z.boolean(),
  paymentMethodName: z.string().min(1, "Payment method name is required"),
  instructions: z.string().min(1, "Instructions are required"),
});

type PaymentSettingsType = z.infer<typeof PaymentSettingsSchema>;

// Default values for payment settings
const defaultPaymentValues: PaymentSettingsType = {
  enableManualPayments: false,
  paymentMethodName: "",
  instructions: "",
};

interface PaymentSettingsProps {
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
  onFieldChange: (field: keyof PaymentSettingsType, value: string) => void;
  type?: "input" | "textarea";
}

function PaymentSettings({ role: _role }: PaymentSettingsProps) {
  const { t } = useTranslation("payments");
  const { updateOrganizationSetting, payment_details } =
    useOrganizationSettings();

  // Safely parse payment_details with fallback to defaults
  const getInitialValues = (): PaymentSettingsType => {
    if (payment_details) {
      try {
        const parsed = JSON.parse(
          payment_details,
        ) as Partial<PaymentSettingsType>;
        return { ...defaultPaymentValues, ...parsed };
      } catch (error) {
        console.error("Error parsing payment_details:", error);
        return defaultPaymentValues;
      }
    }
    return defaultPaymentValues;
  };

  const form = useForm<PaymentSettingsType>({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: getInitialValues(),
  });

  const updatePaymentSetting = (updatedData: Partial<PaymentSettingsType>) => {
    const currentValues = form.getValues();
    const newValues = { ...currentValues, ...updatedData };

    updateOrganizationSetting.mutate({
      key: "payment_details",
      value: JSON.stringify(newValues),
    });
  };

  const handleSwitchChange = (
    field: keyof PaymentSettingsType,
    value: boolean,
  ) => {
    form.setValue(field, value);
    updatePaymentSetting({ [field]: value });
  };

  const handleFieldChange = (
    field: keyof PaymentSettingsType,
    value: string,
  ) => {
    form.setValue(field, value);
    updatePaymentSetting({ [field]: value });
  };

  return (
    <div className="mt-4 w-full max-w-full md:pr-48 pr-0 pb-32 space-y-8">
      <Form {...form}>
        {/* Enable Manual Payments Toggle */}
        <SwitchSetting
          title={t("settings.enableManualPayments.title")}
          description={t("settings.enableManualPayments.description")}
          checked={form.getValues("enableManualPayments")}
          onCheckedChange={(checked) =>
            handleSwitchChange("enableManualPayments", checked)
          }
        />

        {/* Conditional fields shown only when manual payments are enabled */}
        {form.getValues("enableManualPayments") && (
          <div className="p-4 md:p-6 space-y-6 bg-gray-50 rounded-lg">
            {/* Payment Method Name */}
            <FormFieldComponent
              name="paymentMethodName"
              label={t("settings.paymentMethodName.title")}
              description={t("settings.paymentMethodName.description")}
              placeholder={t("settings.paymentMethodName.placeholder")}
              onFieldChange={handleFieldChange}
            />

            <Separator />

            {/* Instructions */}
            <FormFieldComponent
              name="instructions"
              label={t("settings.instructions.title")}
              description={t("settings.instructions.description")}
              placeholder={t("settings.instructions.placeholder")}
              onFieldChange={handleFieldChange}
              type="textarea"
            />
          </div>
        )}
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
}: FormFieldProps) {
  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            className="min-h-[120px] resize-none text-gray-700"
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) =>
              onFieldChange(name as keyof PaymentSettingsType, e.target.value)
            }
          />
        );

      default:
        return (
          <ThemedInput
            placeholder={placeholder}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
              onFieldChange(name as keyof PaymentSettingsType, e.target.value)
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
  );
}

export default PaymentSettings;
