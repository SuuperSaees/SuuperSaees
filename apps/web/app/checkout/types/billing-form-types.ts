import { z } from 'zod';

import { Service } from '~/lib/services.types';

export const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  state_province_region: z.string().min(1, 'State/Province/Region is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  buying_for_organization: z.boolean().default(false),
  enterprise_name: z.string(),
  tax_code: z.string(),
  discount_coupon: z.string(),
  card_name: z.string().min(0, 'Card name is required').optional(),
  card_number: z.string().min(0, 'Card number is required').optional(),
  card_expiration_date: z
    .string()
    .min(0, 'Card expiration date is required')
    .optional(),
  card_cvv: z.string().min(0, 'Card CVV is required').optional(),
  manual_payment_info: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
export type ServiceType = Service.Type;