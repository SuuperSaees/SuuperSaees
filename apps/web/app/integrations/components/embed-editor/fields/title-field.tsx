import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Text } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel } from "@kit/ui/form"
import { Input } from "@kit/ui/input"
import type { FormValues } from "../../schema"

interface TitleFieldProps {
  control: Control<FormValues>
}

export function TitleField({ control }: TitleFieldProps) {
  const { t } = useTranslation("integrations")

  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {t("form.inputs.title.label")}
            <span className="ml-0.5 text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Text className="h-4 w-4" />
              </div>
              <Input placeholder={t("form.inputs.title.placeholder")} className="flex-1" {...field} />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  )
}

