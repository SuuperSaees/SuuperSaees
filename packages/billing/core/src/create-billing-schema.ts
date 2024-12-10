import { z } from 'zod';


export enum LineItemType {
  Flat = 'flat',
  PerSeat = 'per_seat',
  Metered = 'metered',
}

const BillingIntervalSchema = z.enum(['month', 'year']);
const LineItemTypeSchema = z.enum(['flat', 'per_seat', 'metered', 'per_unit']);

export const BillingProviderSchema = z.enum([
  'stripe',
  'paddle',
  'lemon-squeezy',
  'treli',
  'suuper',
]);

export const PaymentTypeSchema = z.enum(['one-time', 'recurring']);

export const LineItemSchema = z
  .object({
    id: z
      .string({
        description:
          'Unique identifier for the line item. Defined by the Provider.',
      })
      .min(1),
    name: z
      .string({
        description: 'Name of the line item. Displayed to the user.',
      })
      .min(1),
    description: z
      .string({
        description:
          'Description of the line item. Displayed to the user and will replace the auto-generated description inferred' +
          ' from the line item. This is useful if you want to provide a more detailed description to the user.',
      })
      .optional(),
    cost: z
      .number({
        description: 'Cost of the line item. Displayed to the user.',
      }),
    type: LineItemTypeSchema,
    unit: z
      .string({
        description:
          'Unit of the line item. Displayed to the user. Example "seat" or "GB"',
      })
      .optional(),
    setupFee: z
      .number({
        description: `Lemon Squeezy only: If true, in addition to the cost, a setup fee will be charged.`,
      })
      .positive()
      .optional(),
    tiers: z
      .array(
        z.object({
          cost: z.number().min(0),
          upTo: z.union([z.number().min(0), z.literal('unlimited')]),
        }),
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.type !== LineItemType.Metered ||
      (data.unit && data.tiers !== undefined),
    {
      message: 'Metered line items must have a unit and tiers',
      path: ['type', 'unit', 'tiers'],
    },
  )
  .refine(
    (data) => {
      if (data.type === LineItemType.Metered) {
        return data.cost === 0;
      }

      return true;
    },
    {
      message:
        'Metered line items must have a cost of 0. Please add a different line item type for a flat fee (Stripe)',
      path: ['type', 'cost'],
    },
  );

export const PlanSchema = z
  .object({
    id: z
      .string({
        description: 'Unique identifier for the plan. Defined by yourself.',
      })
      .min(1),
    name: z
      .string({
        description: 'Name of the plan. Displayed to the user.',
      }),
    interval: BillingIntervalSchema.optional(),
    custom: z.boolean().default(false).optional(),
    label: z.string().min(1).optional(),
    buttonLabel: z.string().min(1).optional(),
    href: z.string().min(1).optional(),
    lineItems: z.array(LineItemSchema).refine(
      (schema) => {
        const types = schema.map((item) => item.type);

        const perSeat = types.filter(
          (type) => type === LineItemType.PerSeat,
        ).length;

        const flat = types.filter((type) => type === LineItemType.Flat).length;

        return perSeat <= 1 && flat <= 1;
      },
      {
        message: 'Plans can only have one per-seat and one flat line item',
        path: ['lineItems'],
      },
    ),
    trialDays: z
      .number({
        description:
          'Number of days for the trial period. Leave empty for no trial.',
      })
      .optional(),
    paymentType: PaymentTypeSchema,
  });

const ProductSchema = z
  .object({
    id: z
      .string({
        description:
          'Unique identifier for the product. Defined by th Provider.',
      })
      .min(1),
    name: z
      .string({
        description: 'Name of the product. Displayed to the user.',
      })
      .min(1),
    description: z
      .string({
        description: 'Description of the product. Displayed to the user.',
      })
      .min(1),
    currency: z
      .string({
        description: 'Currency code for the product. Displayed to the user.',
      })
      .min(3)
      .max(3),
    badge: z
      .string({
        description:
          'Badge for the product. Displayed to the user. Example: "Popular"',
      })
      .optional(),
    features: z
      .array(
        z.string({
          description: 'Features of the product. Displayed to the user.',
        }),
      )
      .nonempty(),
    enableDiscountField: z
      .boolean({
        description: 'Enable discount field for the product in the checkout.',
      })
      .optional(),
    highlighted: z
      .boolean({
        description: 'Highlight this product. Displayed to the user.',
      })
      .optional(),
    plans: z.array(PlanSchema),
  })
  .refine(
    (item) => {
      const planIds = item.plans.map((plan) => plan.id);

      return planIds.length === new Set(planIds).size;
    },
    {
      message: 'Plan IDs must be unique',
      path: ['plans'],
    },
  );

const BillingSchema = z
  .object({
    provider: BillingProviderSchema,
    products: z.array(ProductSchema),
  })
  .refine(
    (schema) => {
      if (schema.provider === 'lemon-squeezy') {
        for (const product of schema.products) {
          for (const plan of product.plans) {
            if (plan.lineItems.length > 1) {
              return false;
            }
          }
        }
      }

      return true;
    },
    {
      message: 'Lemon Squeezy only supports one line item per plan',
      path: ['provider', 'products'],
    },
  );
export function createBillingSchema(config: z.infer<typeof BillingSchema>) {
  return BillingSchema.parse(config);
}

export type BillingConfig = z.infer<typeof BillingSchema>;
export type ProductSchema = z.infer<typeof ProductSchema>;

export function getPlanIntervals(config: {products: any[]}) {
  // Verifica si config.products es un arreglo y no está vacío
  if (!Array.isArray(config.products)) {
    return []; // Retorna un arreglo vacío si products no es un arreglo
  }

  const intervals = config.products
    .flatMap((product) => {
      // Verifica si plans existe y no está vacío
      return product?.plans && product.plans.length > 0
        ? product.plans.map((plan: any) => plan.interval)
        : []; // Retorna un arreglo vacío si plans está vacío
    })
    .filter(Boolean); // Filtra cualquier valor falsy

  return intervals; // Retorna los intervalos
}

/**
 * @name getPrimaryLineItem
 * @description Get the primary line item for a plan
 * By default, the primary line item is the first line item in the plan for Lemon Squeezy
 * For other providers, the primary line item is the first flat line item in the plan. If there are no flat line items,
 * the first line item is returned.
 *
 * @param config
 * @param planId
 */
export function getPrimaryLineItem(
  config: {products: any[]},
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      if (plan.id === planId) {
        // Lemon Squeezy only supports one line item per plan
        // if (config.provider === 'lemon-squeezy') {
        //   return plan.lineItems[0];
        // }

        const flatLineItem = plan.lineItems.find(
          (item: { type: LineItemType; }) => item.type === LineItemType.Flat,
        );

        if (flatLineItem) {
          return flatLineItem;
        }

        return plan.lineItems[0];
      }
    }
  }

  throw new Error('Base line item not found');
}

export function getProductPlanPair(
  config: z.infer<typeof BillingSchema>,
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      if (plan.id === planId) {
        return { product, plan };
      }
    }
  }

  throw new Error('Plan not found');
}

export function getProductPlanPairByVariantId(
  config: z.infer<typeof BillingSchema>,
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      for (const lineItem of plan.lineItems) {
        if (lineItem.id === planId) {
          return { product, plan };
        }
      }
    }
  }

  throw new Error('Plan not found');
}

export function getLineItemTypeById(
  config: z.infer<typeof BillingSchema>,
  id: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      for (const lineItem of plan.lineItems) {
        if (lineItem.id === id) {
          return lineItem.type;
        }
      }
    }
  }

  throw new Error(`Line Item with ID ${id} not found`);
}