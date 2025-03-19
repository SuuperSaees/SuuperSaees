"use client"

import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FormField, FormItem, FormLabel } from "@kit/ui/form"
import SelectAction from "~/components/ui/select"
import { FormValues } from "../../../schema"


interface LocationFieldProps {
  control: Control<FormValues>
}

export function LocationField({ control }: LocationFieldProps) {
  const { t } = useTranslation("embeds")

  return (
    <FormField
      control={control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {t("form.inputs.location.label")}
            <span className="ml-0.5 text-red-500">*</span>
          </FormLabel>
          <SelectAction
            options={t("form.inputs.location.options", {
              returnObjects: true,
            })}
            onValueChange={field.onChange}
            defaultValue={field.value}
          />
        </FormItem>
      )}
    />
  )
}

