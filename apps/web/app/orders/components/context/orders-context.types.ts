import { Order } from "~/lib/order.types";
import { User } from "~/lib/user.types";

// Context
export interface OrdersContextType {
  orders: Order.Response[];
  setOrders: React.Dispatch<React.SetStateAction<Order.Response[]>>;
  agencyMembers: User.Response[];
  agencyId: Order.Type['agency_id'];
}

// Provider
export interface OrdersProviderProps {
  children: React.ReactNode;
  agencyMembers: User.Response[];
  agencyId: Order.Type['agency_id'];
}