'use server';

import { createOrdersAction } from "./orders";

function getOrdersAction() {
    return createOrdersAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function getPublicOrderById(orderId: number) {
    const ordersAction = getOrdersAction();
    return await ordersAction.getPublicOrderById(orderId);
}

export async function updateOrderTags(orderId: number, tagIds: string[]) {
    const ordersAction = getOrdersAction();
    return await ordersAction.updateOrderTags(orderId, tagIds);
}