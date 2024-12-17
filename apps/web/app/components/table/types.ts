import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Brief } from '~/lib/brief.types';
import { Order } from '~/lib/order.types';
import { Service } from '~/lib/services.types';

export type EntityData = {
  orders: Order.Response[];
  briefs: Brief.Relationships.Services.Response[];
  services: Service.Relationships.Billing.BillingService[];
};

// Define configuration types for each entity

type ServicePermissions = {
  edit: boolean;
  delete: boolean;
  checkout: boolean;
};

export type ColumnConfigs = {
  orders: {
    hasPermission?: (row?: string) => boolean;
  };
  briefs: {
    hasPermission?: (row?: string) => boolean;
  };
  services: {
    paymentsMethods: BillingAccounts.PaymentMethod[];
    hasPermission: (
      row?: keyof (EntityData['services'][0] & ServicePermissions),
    ) => boolean;
  };
};
