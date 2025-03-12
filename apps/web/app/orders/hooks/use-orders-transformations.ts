import { Account } from '~/lib/account.types';
import { Order } from '~/lib/order.types';
import { User } from '~/lib/user.types';

const useOrdersTransformations = () => {
  const getClientUsers = (orders: Order.Response[]) => {
    const clientsLib = new Map<string, User.Response>();

    orders.forEach((order) => {
      if (!order.customer || !order.customer.id) return;
      if (clientsLib.has(order.customer.id)) return;
      clientsLib.set(order.customer.id, order.customer);
    });

    return Array.from(clientsLib.values());
  };

  const getClientOrganizations = (orders: Order.Response[]) => {
    const clientOrganizationsLib = new Map<string, Account.Response>();

    orders.forEach((order) => {
      const clientOrg = order.client_organization;

      if (
        clientOrg && // Ensure client_organization exists
        clientOrg.id && // Ensure client_organization.id is defined
        !clientOrganizationsLib.has(clientOrg.id) // Check if the id is not already in the map
      ) {
        clientOrganizationsLib.set(clientOrg.id, clientOrg);
      }
    });

    return Array.from(clientOrganizationsLib.values());
  };

  return {
    getClientUsers,
    getClientOrganizations,
  };
};

export default useOrdersTransformations;
