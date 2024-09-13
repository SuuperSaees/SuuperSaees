import { NextRequest, NextResponse } from "next/server";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(request: NextRequest) {
    try {
        // Obtén la lista de productos
        const products = await stripe.products.list({
            active: true,
        });

        // Crea una lista de promesas para obtener los precios
        const productsWithPrices = await Promise.all(products.data.map(async (product) => {
            const priceId = product.default_price;
            let price = null;

            if (priceId) {
                // Obtén la información del precio
                try {
                    price = await stripe.prices.retrieve(priceId);
                } catch (error) {
                    console.error(`Error al obtener el precio para el producto ${product.id}: `, error);
                }
            }

            return {
                ...product,
                unit_amount: price ? price.unit_amount : null,
            };
        }));

        return NextResponse.json(productsWithPrices);

    } catch (error) {
        console.error("Error al obtener productos y precios: ", error);

        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}

