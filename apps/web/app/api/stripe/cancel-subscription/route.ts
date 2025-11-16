import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
  const subscriptionId = searchParams.get('subscriptionId');
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
           const subscription = await stripe.subscriptions.cancel(subscriptionId);

        return NextResponse.json(subscription);
    } catch (error) {
        return NextResponse.json(
            {error: {message: "Internal Server Error"}},
            {status: 500}
        )
    }
}
