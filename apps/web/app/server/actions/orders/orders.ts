import { BaseAction } from '../base-action';
import { IOrdersAction } from './orders.interface';
import { OrdersController } from './controllers/orders.controller';

export class OrdersAction extends BaseAction implements IOrdersAction {
    private controller: OrdersController;
    
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new OrdersController(this.baseUrl, this.client, this.adminClient);
    }

    async getPublicOrderById(orderId: number) {
        return await this.controller.getPublicOrderById(orderId);
    }

    async updateOrderTags(orderId: number, tagIds: string[]) {
        return await this.controller.updateOrderTags(orderId, tagIds);
    }
}

export function createOrdersAction(baseUrl: string) {
    return new OrdersAction(baseUrl);
}