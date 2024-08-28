import { NextRequest, NextResponse } from "next/server";


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    
    const { email } = await req.json();

    try {
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
