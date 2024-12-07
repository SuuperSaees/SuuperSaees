import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    const { email } = await req.clone().json();
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
           const customer = await stripe.customers.create({
            email
           });
        return NextResponse.json(customer);
    } catch (error) {
        return NextResponse.json(
            {error: {message: "Internal Server Error"}},
            {status: 500}
        )
    }
}