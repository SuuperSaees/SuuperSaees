import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    const { priceId, stripeId } = await req.json(); 

    console.log('Price ID:', priceId);
    console.log('Stripe ID en la API:', stripeId);

    try {
    
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], 
            line_items: [
                {
                    price: priceId, 
                    quantity: 1, 
                },
            ],
            mode: 'payment', // It works if it is a one-time payment
            // mode: 'subscription', // It works if it is a subscription type payment
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`, 
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
        }, {
            stripeAccount: stripeId,
        }
    );

        console.log('Session ID:', session);

        return NextResponse.json({ sessionUrl: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}
