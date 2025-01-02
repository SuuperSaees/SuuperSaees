import { OrdersRepository } from "../repositories/orders.repository";
import { IOrdersService } from "./orders.service.interface";
import { Order } from "~/lib/order.types";

export class OrdersService implements IOrdersService {
    constructor(private readonly ordersRepository: OrdersRepository) {}

    async getPublicOrderById(orderId: number): Promise<Order.Type> {
        return this.ordersRepository.getPublicOrderById(orderId);
    }
}