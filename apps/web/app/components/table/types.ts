import { UseMutationResult } from '@tanstack/react-query';
import { Brief } from '~/lib/brief.types';
import { Order } from '~/lib/order.types';
import { Service } from '~/lib/services.types';
import { User } from '~/lib/user.types';

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
    data: {
      orderAgencyMembers: User.Response[];
    };
    actions: {
      updateOrderDate: UseMutationResult<{ order: Order.Type; user: User.Type | undefined }, Error, { due_date: string; orderId: number }, unknown>;
      updateOrderAssigns: UseMutationResult<void, Error, { agencyMemberIds: string[]; orderId: number }, unknown>;
    };
    hasPermission: () => boolean;
  };
  briefs: {
    hasPermission?: (row?: string) => boolean;
  };
  services: {
    hasPermission: (
      row?: keyof (EntityData['services'][0] & ServicePermissions),
    ) => boolean;
  };
};
