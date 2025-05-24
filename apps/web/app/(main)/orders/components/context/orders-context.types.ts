import { Order } from "~/lib/order.types";
import { User } from "~/lib/user.types";

// Pagination response type to match the server response
export interface PaginatedOrdersResponse {
  data: Order.Response[];
  nextCursor: string | null;
  count: number | null;
  pagination: {
    limit: number;
    hasNextPage: boolean;
    totalPages: number | null;
    currentPage: number | null;
    isOffsetBased: boolean;
  };
}

// Context
export interface OrdersContextType {
  orders: Order.Response[];
  setOrders: React.Dispatch<React.SetStateAction<Order.Response[]>>;
  agencyMembers: User.Response[];
  agencyId: Order.Type['agency_id'];
  ordersAreLoading: boolean;
  queryKey: (string | { page: number; limit: number })[];
  
  // Pagination properties
  nextCursor: string | null;
  count: number | null;
  hasNextPage: boolean;
  totalPages: number | null;
  currentPage: number | null;
  limit: number;
  isOffsetBased: boolean;
  
  // Pagination functions
  loadNextPage: () => Promise<void>;           // For cursor-based infinite scroll
  goToPage: (page: number) => void;            // For offset-based page navigation (now synchronous!)
  updateLimit: (newLimit: number) => void;     // For updating rows per page
  isLoadingMore: boolean;
}


// Provider
export interface OrdersProviderProps {
  children: React.ReactNode;
  agencyMembers: User.Response[];
  agencyId: Order.Type['agency_id'];
  initialOrders?: PaginatedOrdersResponse;
}