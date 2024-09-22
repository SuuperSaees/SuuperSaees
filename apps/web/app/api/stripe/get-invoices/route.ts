import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
  const customer = searchParams.get('customerId');
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
           const invoices = await stripe.invoices.list({
            customer,
           });
        return NextResponse.json(invoices.data);
    } catch (error) {
        return NextResponse.json(
            {error: {message: "Internal Server Error"}},
            {status: 500}
        )
    }
}
