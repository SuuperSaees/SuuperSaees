import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customer = searchParams.get('customerId');
  const price = searchParams.get('priceId');
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
           const subscription = await stripe.subscriptions.create({
            customer: customer,
            items: [
                {
                  price: price,
                },
              ],
           });
        return NextResponse.json(subscription);
    } catch (error) {
        return NextResponse.json(
            {error: {message: "Internal Server Error "}},
            {status: 500}
        )
    }
}
