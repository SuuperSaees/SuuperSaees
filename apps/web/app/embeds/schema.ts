import { z } from "zod"

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icon: z.string().optional().nullable(),
  location: z.enum(["tab", "sidebar"]),
  type: z.enum(["url", "iframe"]),
  visibility: z.enum(["public", "private"]),
  value: z.string(),
  embed_accounts: z.array(z.string()).optional(),
})

export type FormValues = z.infer<typeof formSchema>

export interface SelectOption {
  label: string
  value: string
  icon?: string
}

export interface Organization {
  id: string
  name: string
  picture_url?: string
}

