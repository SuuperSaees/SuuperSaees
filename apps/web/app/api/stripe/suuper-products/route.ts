import { NextRequest, NextResponse } from "next/server";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(request: NextRequest) {
    try {
        // Obtén la lista de productos
        const products = await stripe.products.list({
            active: true,
        });

        // Crea una lista de promesas para obtener los precios
        const productsWithPlans = await Promise.all(products.data.map(async (product) => {
                // Obtén la información del plan
                try {
                    const plans = await stripe.plans.list({
                        active: true,
                        product: product.id
                    });
                    return {
                        ...product,
                        plan: plans?.data[0] 
                    };
                } catch (error) {
                    console.error(`Error al obtener el precio para el producto ${product.id}: `, error);
                }
        }));

        return NextResponse.json(productsWithPlans);

    } catch (error) {
        console.error("Error al obtener productos y precios: ", error);

        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}

