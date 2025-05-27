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

// Union type for query responses - can be either paginated or just an array
export type OrdersQueryResponse = PaginatedOrdersResponse | Order.Response[];

// Context
export interface OrdersContextType {
  orders: Order.Response[];
  setOrders: React.Dispatch<React.SetStateAction<Order.Response[]>>;
  agencyMembers: User.Response[];
  agencyId: Order.Type['agency_id'];
  ordersAreLoading: boolean;
  queryKey: (string | { page: number; limit: number; search: string })[];
  
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

  // Search function
  handleSearch: (term: string) => void;        // For handling search
  searchTerm: string;                          // Current search term
}

// Custom query function type - now supports both paginated and non-paginated responses
export type CustomQueryFn = (params: {
  page: number;
  limit: number;
  searchTerm: string;
}) => Promise<OrdersQueryResponse>;

// Provider
export interface OrdersProviderProps {
  children: React.ReactNode;
  agencyMembers: User.Response[];
  agencyId: Order.Type['agency_id'];
  initialOrders?: OrdersQueryResponse;
  // Optional custom query function and key
  customQueryFn?: CustomQueryFn;
  customQueryKey?: string[];
}