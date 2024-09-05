import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definición de tipos para los datos entrantes
interface ProductRequest {
    accountId: string;
    name: string;
    description: string;
    imageUrl?: string; // URL de la imagen opcional
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { accountId, name, description, imageUrl }: ProductRequest = await req.json();
    const productId = searchParams.get('productId')

    if (!productId) {
        return NextResponse.json(
            { error: { message: "Product ID is required" } },
            { status: 400 }
        );
    }

    try {
        // Crear producto en la cuenta conectada de Stripe
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
