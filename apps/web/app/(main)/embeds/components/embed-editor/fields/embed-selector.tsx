import React from "react"
import { useTranslation } from "react-i18next"
import { FormLabel } from "@kit/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@kit/ui/select"
import { Embeds } from "~/lib/embeds.types"

interface EmbedSelectorProps {
  embeds: (Embeds.Type & { embed_accounts: string[] })[]
  onSelect: (embed: Embeds.Type & { embed_accounts: string[] }) => void
  showSelector?: boolean
}

export function EmbedSelector({ embeds, onSelect, showSelector = true }: EmbedSelectorProps) {
  const { t } = useTranslation("embeds")

  // If showSelector is false, don't render anything
  if (!showSelector) {
    return null
  }

  return (
    <div className="mb-4">
      <FormLabel className="text-sm font-medium">
        {t("form.inputs.template.label")}
      </FormLabel>
      <Select
        onValueChange={(value) => {
          const selected = embeds.find((embed) => embed.id === value)
          if (selected) {
            onSelect(selected)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("form.inputs.template.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          {embeds.map((embed) => (
            <SelectItem key={embed.id} value={embed.id}>
              {embed.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 