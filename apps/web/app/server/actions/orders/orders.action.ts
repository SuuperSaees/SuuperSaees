'use server';

import { createOrdersAction } from "./orders";

const ordersAction = createOrdersAction("");

export async function getPublicOrderById(orderId: number) {
    if(!ordersAction) return;
    return await ordersAction.getPublicOrderById(orderId);
}