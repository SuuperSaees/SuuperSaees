import { NextRequest, NextResponse } from "next/server";


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definición de tipos para los datos entrantes
interface ProductRequest {
    accountId: string;
    name: string;
    description: string;
    imageUrl?: string; // URL de la imagen opcional
}

export async function POST(req: NextRequest) {
    const { accountId, name, description, imageUrl }: ProductRequest = await req
      .clone()
      .json();

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

        const product = await stripe.products.create(productData, {
            stripeAccount: accountId, // ID de la cuenta conectada
        });

        return NextResponse.json({ productId: product.id });
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}