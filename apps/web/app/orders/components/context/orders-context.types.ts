import { Order } from "~/lib/order.types";

// Context
export interface OrdersContextType {
  orders: Order.Response[];
  setOrders: React.Dispatch<React.SetStateAction<Order.Response[]>>;
}

// Provider
export interface OrdersProviderProps {
  children: React.ReactNode;
  initialOrders: Order.Response[];
}