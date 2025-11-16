import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface ProductRequest {
    accountId: string;
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { accountId }: ProductRequest = await req.clone().json();
    const priceId = searchParams.get('priceId');

    if (!priceId) {
        return NextResponse.json(
            { error: { message: "Price ID is required" } },
            { status: 400 }
        );
    }

    try {
        // Get the price to identify the associated product
        const price = await stripe.prices.retrieve(priceId, {
            stripeAccount: accountId, // Connected account ID
        });

        const productId = price.product;

        // Deactivate the price
        await stripe.prices.update(priceId, {
            active: false,
        }, {
            stripeAccount: accountId,
        });

        // Deactivate the product (instead of deleting it)
        const product = await stripe.products.update(productId, {
            active: false, // Change to archived: true if you want to archive
        }, {
            stripeAccount: accountId,
        });

        return NextResponse.json({ message: "Price and product deactivated successfully", product });
    } catch (error) {
        console.error("Error deactivating price and product:", error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}