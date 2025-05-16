"use client"

import { useTranslation } from "react-i18next"
import { useState } from "react"
import { z } from "zod"
import type React from "react" // Added import for React

import CheckboxCombobox, { type CustomItemProps, type Option } from "~/components/ui/checkbox-combobox"
import type { Order } from "~/lib/order.types"
import AvatarDisplayer from "./ui/avatar-displayer"

const CustomUserItem: React.FC<
  CustomItemProps<
    Option & {
      picture_url?: string | null
    }
  >
> = ({ option }) => (
  <div className="flex items-center space-x-2">
    <AvatarDisplayer className="font-normal" pictureUrl={option?.picture_url ?? null} displayName={option.label} />
    <span>{option.label}</span>
  </div>
)

interface ActivityAssignationProps {
  assignedTo: Order.Type["assigned_to"]
  updateFunction: (data: string[]) => void
  searchUserOptions: {
    picture_url: string | null
    value: string
    label: string
  }[]
  canAddAssignes: boolean
  isLoading?: boolean
}

const ActivityAssignations = ({
  assignedTo,
  updateFunction,
  searchUserOptions,
  canAddAssignes = false,
  isLoading = false,
}: ActivityAssignationProps) => {
  const { t } = useTranslation("orders")
  const [selectedMembers, setSelectedMembers] = useState(assignedTo?.map((account) => account.agency_member.id) ?? [])

  // Update avatarsWithStatus based on selected members
  const avatarsWithStatus = selectedMembers.map((memberId) => {
    // First try to find in assignedTo
    const member = assignedTo?.find((a) => a.agency_member.id === memberId)?.agency_member
    // If not found, search in searchUserOptions
    if (!member) {
      const searchOption = searchUserOptions.find((option) => option.value === memberId)
      if (searchOption) {
        return {
          id: searchOption.value,
          name: searchOption.label,
          picture_url: searchOption.picture_url,
          settings: {
            name: searchOption.label,
            picture_url: searchOption.picture_url,
          },
          status: undefined,
        }
      }
    }
    return {
      ...member,
      status: undefined,
    }
  })

  const membersAssignedSchema = z.object({
    agency_members: z.array(z.string()),
  })

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    updateFunction(data.agency_members)
  }

  const defaultValues = {
    agency_members: selectedMembers,
  }

  const handleChange = (newValues: string[]) => {
    setSelectedMembers(newValues)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium py-1.5">{t("details.assignedTo")}</span>
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        {avatarsWithStatus.map((avatar, index) => (
          <AvatarDisplayer
            key={avatar?.id ?? index}
            displayName={Array.isArray(avatar?.settings) ? avatar?.settings?.[0]?.name ?? avatar?.name ?? "" : avatar?.settings?.name ?? avatar?.name ?? ""}
            isAssignedOrFollower={true}
            pictureUrl={Array.isArray(avatar?.settings) ? avatar?.settings?.[0]?.picture_url ?? avatar?.picture_url : avatar?.settings?.picture_url ?? avatar?.picture_url}
            status={avatar?.status}
            className="h-8 w-8 border-2 border-white"
          />
        ))}
        {canAddAssignes && (
          <CheckboxCombobox
            options={searchUserOptions ?? []}
            onSubmit={handleFormSubmit}
            schema={membersAssignedSchema}
            defaultValues={defaultValues}
            customItem={CustomUserItem}
            isLoading={isLoading}
            values={selectedMembers}
            onChange={handleChange}
          />
        )}
      </div>
    </div>
  )
}

export default ActivityAssignations

