import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definición de tipos para los datos entrantes
interface ProductRequest {
    accountId: string;
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { accountId }: ProductRequest = await req.json();
    const productId = searchParams.get('productId')

    if (!productId) {
        return NextResponse.json(
            { error: { message: "Product ID is required" } },
            { status: 400 }
        );
    }

    try {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const product = await stripe.products.del(productId, {
            stripeAccount: accountId, // ID de la cuenta conectada
        });

        return NextResponse.json({ product });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}
