import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const stripeId = searchParams.get('accountId');
    const priceId = searchParams.get('priceId');
    if (!stripeId || !priceId) {
        return NextResponse.json(
            { error: { message: "Account ID is required" } },
            { status: 400 }
        );
    }

    try {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const price = await stripe.prices.retrieve(priceId, {
            stripeAccount: stripeId,
        });
        return NextResponse.json({ price });
    } catch (error) {
        return NextResponse.json(
            { error: { message: "Internal Server Error" } },
            { status: 500 }
        );
    }
}