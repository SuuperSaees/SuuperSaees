import { OrdersRepository } from "../repositories/orders.repository";
import { IOrdersService } from "./orders.service.interface";
import { Order } from "~/lib/order.types";
import { OrderTagsRepository } from "../../order-tags/repositories/order-tags.repository";
export class OrdersService implements IOrdersService {
    constructor(private readonly ordersRepository: OrdersRepository, private readonly orderTagsRepository?: OrderTagsRepository) {}

    async getPublicOrderById(orderId: number): Promise<Order.Type> {
        return this.ordersRepository.getPublicOrderById(orderId);
    }

    async updateOrderTags(orderId: number, tagIds: string[]): Promise<void> {
         // 1. Get existing tags
         const existingTags = await this.orderTagsRepository?.get(orderId);
         const existingTagIds = existingTags?.map(tag => tag.tag_id);

         // 2. Calculate tags to add and remove
         const tagsToAdd = tagIds.filter(id => !existingTagIds?.includes(id));
         const tagsToRemove = existingTagIds?.filter(id => !tagIds.includes(id ?? ''));

         // 3. Process tags to remove
         if (tagsToRemove?.length && tagsToRemove?.length > 0) {
             await this.orderTagsRepository?.deleteManyByTagIds(orderId, tagsToRemove as string[]);
         }

         // 4. Process tags to add
         if (tagsToAdd?.length > 0) {
             const newOrderTags = tagsToAdd.map(tagId => ({
                 order_id: orderId,
                 tag_id: tagId
             }));
             await this.orderTagsRepository?.createMany(newOrderTags);
         }
    }
}