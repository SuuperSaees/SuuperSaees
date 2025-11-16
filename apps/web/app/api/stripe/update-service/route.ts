import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface ProductRequest {
    accountId: string;
    name: string;
    description: string;
    imageUrl?: string;
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { accountId, name, description, imageUrl }: ProductRequest = await req
      .clone()
      .json();
    const productId = searchParams.get('productId')

    if (!productId) {
        return NextResponse.json(
            { error: { message: "Product ID is required" } },
            { status: 400 }
        );
    }

    try {
        // Update product in the connected Stripe account
        const productData: {
            name: string;
            description: string;
            images?: string[];
        } = {
            name: name,
            description: description,
            images: imageUrl ? [imageUrl] : undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const product = await stripe.products.update(productId, productData, {
            stripeAccount: accountId, // Connected account ID
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