import { Order } from "~/lib/order.types";

export interface IOrdersService {
    getPublicOrderById(orderId: number): Promise<Order.Type>;
}