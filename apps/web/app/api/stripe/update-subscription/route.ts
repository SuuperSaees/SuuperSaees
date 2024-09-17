import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Defining types for incoming data
interface SubscriptionRequest {
    itemQuantity: number;
    itemId: string;
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { itemQuantity, itemId}: SubscriptionRequest = await req.json();
    const subscriptionId = searchParams.get('subscriptionId')

    if (!subscriptionId) {
        return NextResponse.json(
            { error: { message: "Product ID is required" } },
            { status: 400 }
        );
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const subscriptionData = {
            items: [
                {
                    id: itemId,
                    quantity: itemQuantity,
                },
            ],
        };
        
        const subscription = await stripe.subscriptions.update(subscriptionId, subscriptionData);

        console.log(subscription, "SUBSCRIPTION UPDATED")

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}
