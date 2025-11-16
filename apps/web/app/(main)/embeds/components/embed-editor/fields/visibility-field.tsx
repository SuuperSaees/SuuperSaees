"use client"

import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Globe, Lock } from "lucide-react"
import { FormField, FormItem, FormLabel } from "@kit/ui/form"
import SelectAction from "~/components/ui/select"
import type { FormValues } from "../../../schema"

interface VisibilityFieldProps {
  control: Control<FormValues>
}

export function VisibilityField({ control }: VisibilityFieldProps) {
  const { t } = useTranslation("embeds")

  const visibilityOptions = [
    {
      label: "For everyone",
      value: "public",
    },
    {
      label: "Private",
      value: "private",
    },
  ]

  return (
    <FormField
      control={control}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {t("form.inputs.visibility.label")}
            <span className="ml-0.5 text-red-500">*</span>
          </FormLabel>
          <SelectAction
            options={visibilityOptions}
            onValueChange={field.onChange}
            defaultValue={field.value}
            customItem={(label) => (
              <div className="flex items-center gap-2">
                {label === "For everyone" ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span>{label}</span>
              </div>
            )}
          />
        </FormItem>
      )}
    />
  )
}

