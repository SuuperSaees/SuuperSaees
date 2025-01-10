import { Order } from "~/lib/order.types";

// Context
export interface OrdersContextType {
  orders: Order.Response[];
}

// Provider
export interface OrdersProviderProps {
  children: React.ReactNode;
  initialOrders: Order.Response[];
}