import { Button } from "@kit/ui/button";
import { Input } from "@kit/ui/input";
import { Check, Plus, X } from "lucide-react";
import { BaseOption, Combobox } from "~/components/ui/combobox";
import { Trans } from "@kit/ui/trans";
import {
  Control,
  useController,
  useFieldArray,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { InvoiceFormData } from "../../schemas/schema";
import { Service } from "~/lib/services.types";
import { formatCurrency } from "@kit/shared/utils";

interface InvoiceItemsSectionProps {
  control: Control<InvoiceFormData>;
  setValue: UseFormSetValue<InvoiceFormData>;
  services: Service.Relationships.Billing.BillingService[];
  currency: string;
}

interface LineItemRowProps {
  control: Control<InvoiceFormData>;
  index: number;
  fieldId: string;
  onRemove: () => void;
  onServiceChange: (serviceId: number) => void;
  canRemove: boolean;
  calculateLineTotal: (rate: number, quantity: number) => number;
  serviceOptions: BaseOption[];
  currency: string;
}

// Utility function to format currency with proper separators

const customRenderItem = (option: BaseOption, isSelected: boolean) => {
  return (
    <div className="flex items-center gap-2 w-full text-gray-600">
      <span className="text-sm font-medium truncate w-full">
        {option.label}
      </span>
      {isSelected && <Check className="w-4 h-4 shrink-0 text-gray-700" />}
    </div>
  );
};

const customRenderTrigger = (selectedOption: BaseOption | null) => {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="text-sm font-medium truncate  w-full">
        {selectedOption?.label ?? (
          <Trans i18nKey="invoices:creation.form.items.description.placeholder" />
        )}
      </span>
    </div>
  );
};

function LineItemRow({
  control,
  index,
  fieldId,
  onRemove,
  onServiceChange,
  canRemove,
  calculateLineTotal,
  serviceOptions,
  currency,
}: LineItemRowProps) {
  const descriptionController = useController({
    control,
    name: `lineItems.${index}.description`,
  });

  const serviceIdController = useController({
    control,
    name: `lineItems.${index}.serviceId`,
  });

  const rateController = useController({
    control,
    name: `lineItems.${index}.rate`,
  });

  const quantityController = useController({
    control,
    name: `lineItems.${index}.quantity`,
  });

  return (
    <div
      key={fieldId}
      className="grid grid-cols-12 gap-4 py-4 items-center border-b border-gray-200 group/line"
    >
      <div className="col-span-5">
        <div className="space-y-1">
          <Combobox
            options={serviceOptions}
            renderItem={customRenderItem}
            renderTrigger={customRenderTrigger}
            triggerClassName="border-none"
            defaultValue={serviceIdController.field.value?.toString() || ""}
            onValueChange={(value) => {
              onServiceChange(Number(value));
            }}
            className="w-full"
          />
          {descriptionController.fieldState.error && (
            <p className="text-red-500 text-xs font-medium px-2">
              {descriptionController.fieldState.error.message}
            </p>
          )}
        </div>
      </div>
      <div className="col-span-2">
        <div className="space-y-1">
          <Input
            readOnly
            type="number"
            placeholder="0.00"
            className="border-none focus:outline-none px-4"
            value={rateController.field.value}
            onChange={(e) =>
              rateController.field.onChange(parseFloat(e.target.value) || 0)
            }
          />
          {rateController.fieldState.error && (
            <p className="text-red-500 text-xs px-2">
              {rateController.fieldState.error.message}
            </p>
          )}
        </div>
      </div>
      <div className="col-span-2">
        <div className="space-y-1">
          <Input
            type="number"
            className="border-none focus:outline-none px-4"
            min="1"
            value={quantityController.field.value}
            onChange={(e) =>
              quantityController.field.onChange(parseInt(e.target.value) || 1)
            }
          />
          {quantityController.fieldState.error && (
            <p className="text-red-500 text-xs px-2">
              {quantityController.fieldState.error.message}
            </p>
          )}
        </div>
      </div>
      <div className="col-span-2 px-4 pt-2">
        {formatCurrency(
          currency,
          calculateLineTotal(
            rateController.field.value,
            quantityController.field.value,
          ),
        )}{" "}
      </div>
      <div className="col-span-1 pt-2">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="group-hover/line:visible invisible"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function InvoiceItemsSection({
  control,
  setValue,
  services,
  currency = "USD",
}: InvoiceItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watchedLineItems = useWatch({
    control,
    name: "lineItems",
  });

  const addLineItem = () => {
    append({ description: "", rate: 0, quantity: 1, serviceId: 0 });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleServiceChange = (index: number, serviceId: number) => {
    const selectedService = services.find(
      (service) => service.id === serviceId,
    );
    if (selectedService) {
      setValue(`lineItems.${index}.description`, selectedService.name, {
        shouldValidate: true,
      });
      setValue(`lineItems.${index}.serviceId`, serviceId, {
        shouldValidate: true,
      });
      setValue(`lineItems.${index}.rate`, selectedService.price ?? 0, {
        shouldValidate: true,
      });
    }
  };

  const calculateLineTotal = (rate: number, quantity: number) => {
    return rate * quantity;
  };

  const calculateSubtotal = () => {
    return watchedLineItems.reduce((sum, item) => {
      const rate = item?.rate ?? 0;
      const quantity = item?.quantity ?? 1;
      return sum + calculateLineTotal(rate, quantity);
    }, 0);
  };

  const serviceOptions: BaseOption[] = services.map((service) => ({
    value: service.id.toString(),
    label: service.name,
  }));

  return (
    <fieldset className="px-3 py-4 text-gray-600">
      <legend className="sr-only">
        <Trans i18nKey="invoices:creation.form.items.title" />
      </legend>
      <div>
        <div className="grid grid-cols-12 gap-4  text-sm font-medium border-b border-gray-200 py-2">
          <div className="col-span-5 px-4 py-2">
            <Trans i18nKey="invoices:creation.form.items.description.label" />
          </div>
          <div className="col-span-2 px-4 py-2">
            <Trans i18nKey="invoices:creation.form.items.rate.label" />
          </div>
          <div className="col-span-2 px-4 py-2">
            <Trans i18nKey="invoices:creation.form.items.quantity.label" />
          </div>
          <div className="col-span-2 px-4 py-2">
            <Trans i18nKey="invoices:creation.form.items.lineTotal.title" />
          </div>
          <div className="col-span-1 px-4 py-2"></div>
        </div>

        {fields.map((field, index) => (
          <LineItemRow
            key={field.id}
            control={control}
            index={index}
            fieldId={field.id}
            onRemove={() => removeLineItem(index)}
            onServiceChange={(serviceId: number) =>
              handleServiceChange(index, serviceId)
            }
            canRemove={fields.length > 1}
            calculateLineTotal={calculateLineTotal}
            serviceOptions={serviceOptions}
            currency={currency}
          />
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLineItem}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          <Trans i18nKey="invoices:creation.form.items.add" />
        </Button>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mt-4">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm py-3">
            <span>
              <Trans i18nKey="invoices:creation.form.items.subtotal.title" />
            </span>
            <span>{formatCurrency(currency, calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between font-medium text-lg py-3">
            <span>
              <Trans i18nKey="invoices:creation.form.items.total.title" />
            </span>
            <span>{formatCurrency(currency, calculateSubtotal())}</span>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
