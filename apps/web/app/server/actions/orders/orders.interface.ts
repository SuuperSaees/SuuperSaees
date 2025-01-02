import { Order } from '~/lib/order.types';

export interface IOrdersAction {
    getPublicOrderById(orderId: number): Promise<Order.Type>;
}