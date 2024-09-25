import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    const { priceId, customer } = await req.json(); 
    if (!priceId) {
        return NextResponse.json(
            { error: { message: "Price ID is required" } },
            { status: 400 }
        );
    }

    if (!customer) {
        return NextResponse.json(
            { error: { message: "Customer ID is required" } },
            { status: 400 }
        );
    }
    
    try {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const price = await stripe.prices.retrieve(priceId);
    
        const { type } = price;


        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], 
            line_items: [
                {
                    price: priceId, 
                    quantity: 1, 
                },
            ],
            customer,
            mode: type === "recurring" ? "subscription" : "payment",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home/settings?checkout=success`, 
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home/settings?checkout=cancel`,
        }
    );
        console.log("SessionURL: ", session.url);

        return NextResponse.json({ sessionUrl: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}