import { Order } from "~/lib/order.types";
import { User } from "~/lib/user.types";

// Context
export interface OrdersContextType {
  orders: Order.Response[];
  setOrders: React.Dispatch<React.SetStateAction<Order.Response[]>>;
  agencyMembers: User.Response[];
}

// Provider
export interface OrdersProviderProps {
  children: React.ReactNode;
  initialOrders: Order.Response[];
  agencyMembers: User.Response[];
}