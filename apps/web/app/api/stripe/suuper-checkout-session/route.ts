import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    const { priceId } = await req.json(); 

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
            mode: type === "recurring" ? "subscription" : "payment",
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`, 
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
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