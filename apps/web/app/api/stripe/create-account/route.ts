import { NextRequest, NextResponse } from "next/server";


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    
    const { email } = await req.json();

    try {
        console.log(email)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const account = await stripe.accounts.create({
        type: 'standard', 
        email: email,
        });

        return NextResponse.json({ accountId: account.id });
    } catch (error) {
        return NextResponse.json(
            {error: {message: "Internal Server Error"}},
            {status: 500}
        )
    }
}
