'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, type LucideIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';

export type MenuItemType = "item" | "submenu" | "separator" | "label"

export interface BaseMenuItem {
  id: string
  type: MenuItemType
  icon?: LucideIcon
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export interface ActionMenuItem extends BaseMenuItem {
  type: "item"
  label: string
  href?: string
  shortcut?: string
  selected?: boolean
}

export interface SubmenuItem extends BaseMenuItem {
  type: "submenu"
  label: string
  items?: MenuItem[]
  content?: ReactNode
  defaultOpen?: boolean
  selectedOption?: string // New: Track selected option
  displaySelection?: boolean // New: Whether to show selection next to label
  selectionMode?: "single" | "none" // New: Control selection behavior
}

export interface SeparatorMenuItem extends BaseMenuItem {
  type: "separator"
}

export interface LabelMenuItem extends BaseMenuItem {
  type: "label"
  label: string
}

export type MenuItem = ActionMenuItem | SubmenuItem | SeparatorMenuItem | LabelMenuItem

export interface DropdownMenuProps {
  trigger: ReactNode
  items: MenuItem[]
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
  onSelectionChange?: (itemId: string, selectedOption: string) => void // New: Callback for selection changes
}


function MenuIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="mr-2 h-4 w-4" />
}

function RenderMenuItem({ item, onSelectionChange }: { 
  item: MenuItem
  onSelectionChange?: (itemId: string, selectedOption: string) => void 
}) {
  switch (item.type) {
    case "item":
      return <ActionItem item={item} />
    case "submenu":
      return <SubmenuItems item={item} onSelectionChange={onSelectionChange} />
    case "separator":
      return <DropdownMenuSeparator />
    case "label":
      return (
        <DropdownMenuLabel
          className={cn("flex items-center", item.className)}
          onClick={item.onClick}
        >
          {item.icon && <MenuIcon icon={item.icon} />}
          {item.label}
        </DropdownMenuLabel>
      )
    default:
      return null
  }
}

function ActionItem({ item }: { item: ActionMenuItem }) {
  const content = (
    <>
      {item.icon && <MenuIcon icon={item.icon} />}
      <span>{item.label}</span>
      {item.shortcut && (
        <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
      )}
      {item.selected && (
        <Check className="ml-auto h-4 w-4" />
      )}
    </>
  )

  return (
    <DropdownMenuItem
      disabled={item.disabled}
      className={cn(item.className)}
      onClick={item.onClick}
      asChild={Boolean(item.href)}
    >
      {item.href ? <a href={item.href}>{content}</a> : content}
    </DropdownMenuItem>
  )
}

function CustomCollapsible({
  children,
  content,
  isOpen,
  onToggle,
  disabled,
  className,
}: {
  children: React.ReactNode
  content: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  disabled?: boolean
  className?: string
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(0)

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        setHeight(entries?.[0]?.contentRect?.height ?? 0)
      })

      resizeObserver.observe(contentRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className={cn("overflow-hidden", className)}>
      <Button
        variant="ghost"
        className="w-full justify-between"
        disabled={disabled}
        onClick={onToggle}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Button>
      <div
        className={cn(
          "overflow-hidden transition-[height] duration-200 ease-in-out",
          !isOpen && "duration-200"
        )}
        style={{ height: isOpen ? height : 0 }}
      >
        <div ref={contentRef}>
          <div className="px-2 py-2">{content}</div>
        </div>
      </div>
    </div>
  )
}

function SubmenuItems({ 
  item,
  onSelectionChange 
}: { 
  item: SubmenuItem
  onSelectionChange?: (itemId: string, selectedOption: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(item.defaultOpen ?? false)

  // If we have regular menu items, render them in a submenu
  if (item.items?.length) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          disabled={item.disabled}
          className={cn("justify-between", item.className)}
          onClick={item.onClick}
        >
          <div className="flex items-center gap-2">
            {item.icon && <MenuIcon icon={item.icon} />}
            <span>{item.label}</span>
            {item.displaySelection && item.selectedOption && (
              <span className="text-muted-foreground">
                {item.selectedOption}
              </span>
            )}
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className='max-h-[400px] overflow-y-auto text-gray-600'>
          {item.items.map((subItem) => {
            if (item.selectionMode === "single" && subItem.type === "item") {
              return (
                <RenderMenuItem
                  key={subItem.id}
                  item={{
                    ...subItem,
                    selected: subItem.label === item.selectedOption,
                    onClick: () => {
                      subItem.onClick?.()
                      onSelectionChange?.(item.id, subItem.label)
                    },
                  }}
                />
              )
            }
            return <RenderMenuItem key={subItem.id} item={subItem} />
          })}
          {item.content && (
            <div className="px-2 py-1.5">
              {item.content}
            </div>
          )}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  // If we only have content, render it in our custom collapsible section
  if (item.content) {
    return (
      <div className="px-1 py-1.5">
        <CustomCollapsible
          isOpen={isOpen}
          onToggle={() => {
            setIsOpen(!isOpen)
            item.onClick?.()
          }}
          disabled={item.disabled}
          className={item.className}
          content={item.content}
        >
          <div className="flex items-center">
            {item.icon && <MenuIcon icon={item.icon} />}
            <span>{item.label}</span>
          </div>
        </CustomCollapsible>
      </div>
    )
  }

  return null
}

export function CustomDropdownMenu({
  trigger,
  items: initialItems,
  side = "bottom",
  align = "start",
  className,
  onSelectionChange,
}: DropdownMenuProps) {
  const [items, setItems] = useState(initialItems)

  const handleSelectionChange = useCallback((itemId: string, selectedOption: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId && item.type === "submenu"
          ? { ...item, selectedOption }
          : item
      )
    )
    onSelectionChange?.(itemId, selectedOption)
  }, [onSelectionChange])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align={align}
        className={cn("w-56 max-h-full overflow-y-auto", className)}
      >
        {items.map((item) => (
          <RenderMenuItem 
            key={item.id} 
            item={item} 
            onSelectionChange={handleSelectionChange}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}