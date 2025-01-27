'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Check, ChevronDown, LucideIcon } from 'lucide-react';

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
  label: string | JSX.Element
  href?: string
  shortcut?: string
  selected?: boolean
}

export interface SubmenuItem extends BaseMenuItem {
  type: "submenu"
  label: string | JSX.Element
  items?: MenuItem[]
  content?: ReactNode
  defaultOpen?: boolean
  selectedOption?: string
  displaySelection?: boolean
  selectionMode?: "single" | "none"
  triggerBehavior?: 'toggle' | 'close-others'
}

export interface SeparatorMenuItem extends BaseMenuItem {
  type: "separator"
}

export interface LabelMenuItem extends BaseMenuItem {
  type: "label"
  label: string | JSX.Element
}

export type MenuItem = ActionMenuItem | SubmenuItem | SeparatorMenuItem | LabelMenuItem

export interface DropdownMenuProps {
  trigger: ReactNode
  items: MenuItem[]
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
  onSelectionChange?: (itemId: string, selectedOption: string) => void
}

function MenuIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="mr-2 h-4 w-4" />
}

function RenderMenuItem({ 
  item, 
  onSelectionChange,
  onToggle,
  isOpen
}: { 
  item: MenuItem
  onSelectionChange?: (itemId: string, selectedOption: string) => void 
  onToggle?: (itemId: string, isOpen: boolean) => void
  isOpen?: boolean
}) {
  switch (item.type) {
    case "item":
      return <ActionItem item={item} />
    case "submenu":
      return <SubmenuItems item={item} onSelectionChange={onSelectionChange} onToggle={onToggle} isOpen={isOpen} />
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
  onSelectionChange,
  onToggle,
  isOpen
}: { 
  item: SubmenuItem
  onSelectionChange?: (itemId: string, selectedOption: string) => void 
  onToggle?: (itemId: string, isOpen: boolean) => void
  isOpen?: boolean
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(item.defaultOpen ?? false)
  const effectiveIsOpen = isOpen ?? internalIsOpen

  const handleToggle = useCallback(() => {
    const newIsOpen = !effectiveIsOpen
    if (item.triggerBehavior === 'close-others') {
      onToggle?.(item.id, newIsOpen)
    } else {
      setInternalIsOpen(newIsOpen)
      onToggle?.(item.id, newIsOpen)
    }
    item.onClick?.()
  }, [effectiveIsOpen, item, onToggle])

  if (item.items?.length) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          disabled={item.disabled}
          className={cn("justify-between", item.className)}
          onClick={handleToggle}
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
                    selected: typeof subItem.label === 'string' && subItem.label === item.selectedOption,
                    onClick: () => {
                      subItem.onClick?.()
                      if (typeof subItem.label === 'string') {
                        onSelectionChange?.(item.id, subItem.label)
                      }
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

  if (item.content) {
    return (
      <div className="px-1 py-1.5">
        <CustomCollapsible
          isOpen={effectiveIsOpen}
          onToggle={handleToggle}
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
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>(() => 
    initialItems
      .filter((item): item is SubmenuItem => item.type === 'submenu' && (item.defaultOpen ?? false))
      .map(item => item.id)
  )

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

  const handleSubmenuToggle = useCallback((itemId: string, isOpen: boolean) => {
    setOpenSubmenuIds(prev => {
      const item = items.find(i => i.id === itemId) as SubmenuItem | undefined
      if (item?.triggerBehavior === 'close-others') {
        return isOpen ? [itemId] : []
      } else {
        return isOpen 
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      }
    })
  }, [items])

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

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
            onToggle={handleSubmenuToggle}
            isOpen={item.type === 'submenu' && openSubmenuIds.includes(item.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

