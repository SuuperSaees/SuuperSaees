'use server';

import { createOrdersAction } from "./orders";

const ordersAction = createOrdersAction("");

export async function getPublicOrderById(orderId: number) {
    if(!ordersAction) return;
    return await ordersAction.getPublicOrderById(orderId);
}

export async function updateOrderTags(orderId: number, tagIds: string[]) {
    if(!ordersAction) return;
    return await ordersAction.updateOrderTags(orderId, tagIds);
}