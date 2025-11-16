import React, { useState } from "react"
import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import dynamic from "next/dynamic"
import { FormControl, FormField, FormItem, FormLabel } from "@kit/ui/form"
import { Input } from "@kit/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover"
import { Button } from "@kit/ui/button"
import type { FormValues } from "../../../schema"
import { EmojiStyle, Theme } from "emoji-picker-react"

// Dynamically import EmojiPicker to reduce initial bundle size
const EmojiPicker = dynamic(() => import("emoji-picker-react").then(mod => {
  return { default: mod.default }
}), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-sm text-gray-500">Loading emoji picker...</div>
})

interface TitleFieldProps {
  control: Control<FormValues>
}

export function TitleField({ control }: TitleFieldProps) {
  const { t } = useTranslation("embeds")
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  
  return (
    <>
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
                <FormField
                  control={control}
                  name="icon"
                  render={({ field: iconField }) => (
                    <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-9 w-9 rounded-lg bg-transparent hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">
                            {iconField.value ? iconField.value : "🔗"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-auto p-0 border-gray-200 shadow-lg">
                        {isEmojiPickerOpen && (
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              iconField.onChange(emojiData.emoji);
                              setIsEmojiPickerOpen(false);
                            }}
                            theme={Theme.LIGHT}
                            lazyLoadEmojis={true}
                            emojiStyle={EmojiStyle.NATIVE}
                            width={280}
                            height={350}
                            previewConfig={{ showPreview: false }}
                            searchPlaceHolder="Search emoji..."
                            style={{ 
                              "--epr-emoji-size": "18px",
                              "--epr-category-emoji-size": "18px",
                              "--epr-emoji-gap": "4px",
                              "--epr-category-font-size": "0.4rem",
                              "--epr-input-font-size": "0.4rem",
                              "--epr-input-padding": "0.2rem",
                              "--epr-input-line-height": "1.2"
                            } as React.CSSProperties}
                            className="bg-white"
                          
                          />
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <Input placeholder={t("form.inputs.title.placeholder")} className="flex-1" {...field} />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </>
  )
}

