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
    const priceId = searchParams.get('priceId');

    if (!priceId) {
        return NextResponse.json(
            { error: { message: "Price ID is required" } },
            { status: 400 }
        );
    }

    try {
        // Obtener el precio para identificar el producto asociado
        const price = await stripe.prices.retrieve(priceId, {
            stripeAccount: accountId, // ID de la cuenta conectada
        });

        const productId = price.product;

        // Desactivar el precio
        await stripe.prices.update(priceId, {
            active: false,
        }, {
            stripeAccount: accountId,
        });

        // Desactivar el producto (en lugar de eliminarlo)
        const product = await stripe.products.update(productId, {
            active: false, // Cambia a archived: true si deseas archivar
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

