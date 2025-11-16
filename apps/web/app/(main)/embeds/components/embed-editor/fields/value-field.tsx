import type { Control, UseFormWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FormControl, FormField, FormItem, FormLabel } from "@kit/ui/form"
import { Textarea } from "@kit/ui/textarea"
import type { FormValues } from "../../../schema"

interface ValueFieldProps {
  control: Control<FormValues>
  watch: UseFormWatch<FormValues>
}

export function ValueField({ control, watch }: ValueFieldProps) {
  const { t } = useTranslation("embeds")
  const type = watch("type")

  return (
    <FormField
      control={control}
      name="value"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            {t("form.inputs.url.label")}
            <span className="ml-0.5 text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={t("form.inputs.url.placeholder", {
                type: type === "link" ? "URL" : "embed URL",
              })}
              {...field}
              rows={5}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

