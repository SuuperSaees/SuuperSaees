'use client'

import { useState } from 'react'
import { CommandItem } from '@kit/ui/command'
import { GripVertical, Trash2 } from 'lucide-react'
import { darkenColor } from '~/utils/generate-colors'
import EditStatusPopover from './edit-status-popover';
import { convertToCamelCase, convertToTitleCase } from '../utils/format-agency-names'
import { AgencyStatus } from '~/lib/agency-statuses.types'
import { Order } from '~/lib/order.types'
import { Subtask } from '~/lib/tasks.types'
import { useTranslation } from 'react-i18next'

interface StatusComboboxItemProps {
  status: AgencyStatus.Type
  onSelect: (value: string) => void
  onDelete: (id: number) => void
  order?: Order.Type
  subtask?: Subtask.Type
  agency_id: string
  mode: 'order' | 'subtask'
  setPopoverValue: (value: string) => void
}

export default function StatusComboboxItem({
  status,
  onSelect,
  onDelete,
  order,
  subtask,
  agency_id,
  mode,
  setPopoverValue,
}: StatusComboboxItemProps) {
  const {t} = useTranslation('orders')
  const [isHovered, setIsHovered] = useState(false)
  const [open, setOpen] = useState<boolean>(false);

  const preventEditName = ['pending', 'completed', 'in_review', 'annulled','anulled','in_progress'].includes(status?.status_name ?? '')

  return (
    <CommandItem
      value={status.status_name}
      onSelect={() => onSelect(status?.status_name ?? '')}
      className="flex w-full items-center justify-between p-0"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => {
        setIsHovered(false)
      }}
    >
      <p
        className="m-2 cursor-pointer rounded-lg p-1 font-medium"
        style={{
          color: status.status_color ? darkenColor(status.status_color, 0.55) : undefined,
          backgroundColor: status.status_color,
        }}
      >
        {preventEditName ? t(`details.statuses.${convertToCamelCase(status?.status_name ?? '')}`) : convertToTitleCase(status?.status_name ?? '')}
      </p>
      <div className="flex gap-2 px-1 text-gray-500">
        {
          isHovered || open ? (
            <div onClick={() => setOpen(true)}>
              <EditStatusPopover
                status_id={status.id}
                status_color={status?.status_color ?? ''}
                status_name={status?.status_name ?? ''}
                order_id={order?.id}
                task_id={subtask?.id}
                agency_id={agency_id}
                setValue={setPopoverValue}
                mode={mode}
                preventEditName={preventEditName}
                open={open}
                setOpen={setOpen}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
              />
            </div>
            
            ) : null
        }
        
        {
          isHovered && !preventEditName && (
            <Trash2
              className="h-5 w-5 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(status.id)
              }}
            />
          )
        }
        {
          isHovered && 
          <GripVertical className="h-5 w-5" />
        }

      </div>
    </CommandItem>
  )
}
