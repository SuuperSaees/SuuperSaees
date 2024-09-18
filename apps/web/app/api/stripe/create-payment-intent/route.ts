import { NextRequest, NextResponse } from "next/server";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest){
    try{
        const { amount } = await request.json();

        console.log("Amount: ", amount);
       

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: {enabled: true},
        }
    );

        // console.log("Payment Intent: ", paymentIntent);

        return NextResponse.json({clientSecret: paymentIntent.client_secret});
        
    } catch (error){
        console.error("Internal Server Error: ", error);

        return NextResponse.json(
            {error: {message: "Internal Server Error"}},
            {status: 500}
        )
    }

}