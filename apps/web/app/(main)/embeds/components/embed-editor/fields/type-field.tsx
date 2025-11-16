"use client"

import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FormControl, FormField, FormItem, FormLabel } from "@kit/ui/form"
import { RadioGroup, RadioGroupItem } from "@kit/ui/radio-group"
import type { FormValues, SelectOption } from "../../../schema"

interface TypeFieldProps {
  control: Control<FormValues>
}

export function TypeField({ control }: TypeFieldProps) {
  const { t } = useTranslation("embeds")

  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem className="text-sm">
          <FormLabel className="text-sm font-medium">
            {t("form.inputs.type.label")}
            <span className="ml-0.5 text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
              {Object.values(t("form.inputs.type.options", { returnObjects: true })).map((option: SelectOption) => (
                <div
                  key={option.value}
                  className={`flex-1 cursor-pointer rounded-lg border p-2 transition-colors ${
                    field.value === option.value
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => field.onChange(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <label htmlFor={option.value} className="block cursor-pointer text-center">
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

