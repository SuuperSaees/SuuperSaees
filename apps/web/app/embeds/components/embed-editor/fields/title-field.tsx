import React, { useState } from "react"
import type { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Text, Image, Link, FileText, ExternalLink, BarChart, PieChart, Calendar, Mail, MessageSquare, Settings, User, Users, Home, Box, LayoutDashboard, Globe, Database, Table, Kanban, Trello, ClipboardList, FileSpreadsheet, FileCode, Map, LineChart, Activity, Bell, Bookmark, Briefcase, CreditCard, ShoppingCart, Truck, Video, Phone } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel } from "@kit/ui/form"
import { Input } from "@kit/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover"
import { Button } from "@kit/ui/button"
import { ScrollArea } from "@kit/ui/scroll-area"
import type { FormValues } from "../../../schema"

// Common icons that might be useful for embeds
const COMMON_ICONS = [
  { name: "text", icon: Text },
  { name: "image", icon: Image },
  { name: "link", icon: Link },
  { name: "file-text", icon: FileText },
  { name: "external-link", icon: ExternalLink },
  { name: "bar-chart", icon: BarChart },
  { name: "pie-chart", icon: PieChart },
  { name: "calendar", icon: Calendar },
  { name: "mail", icon: Mail },
  { name: "message-square", icon: MessageSquare },
  { name: "settings", icon: Settings },
  { name: "user", icon: User },
  { name: "users", icon: Users },
  { name: "home", icon: Home },
  { name: "box", icon: Box },
  // Additional common icons for embed apps
  { name: "layout-dashboard", icon: LayoutDashboard },
  { name: "globe", icon: Globe },
  { name: "database", icon: Database },
  { name: "table", icon: Table },
  { name: "kanban", icon: Kanban },
  { name: "trello", icon: Trello },
  { name: "clipboard-list", icon: ClipboardList },
  { name: "file-spreadsheet", icon: FileSpreadsheet },
  { name: "file-code", icon: FileCode },
  { name: "map", icon: Map },
  { name: "line-chart", icon: LineChart },
  { name: "activity", icon: Activity },
  { name: "bell", icon: Bell },
  { name: "bookmark", icon: Bookmark },
  { name: "briefcase", icon: Briefcase },
  { name: "credit-card", icon: CreditCard },
  { name: "shopping-cart", icon: ShoppingCart },
  { name: "truck", icon: Truck },
  { name: "video", icon: Video },
  { name: "phone", icon: Phone },
]

interface TitleFieldProps {
  control: Control<FormValues>
}

export function TitleField({ control }: TitleFieldProps) {
  const { t } = useTranslation("embeds")
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false)

  // Function to get the icon component by name
  const getIconByName = (iconName: string | null | undefined) => {
    if (!iconName) return Text
    const foundIcon = COMMON_ICONS.find(i => i.name === iconName)
    return foundIcon?.icon ?? Text
  }

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
                    <Popover open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg bg-transparent p-0">
                          {(() => {
                            const IconComponent = getIconByName(iconField.value);
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <ScrollArea className="h-60">
                          <div className="grid grid-cols-4 gap-2">
                            {COMMON_ICONS.map((item) => (
                              <Button
                                key={item.name}
                                variant="ghost"
                                size="icon"
                                className={`h-9 w-9 rounded-md ${iconField.value === item.name ? "bg-gray-100" : ""}`}
                                onClick={() => {
                                  iconField.onChange(item.name);
                                  setIsIconPopoverOpen(false);
                                }}
                              >
                                {(() => {
                                  const IconComponent = item.icon;
                                  return <IconComponent className="h-4 w-4" />;
                                })()}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
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

