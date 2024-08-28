import { NextRequest, NextResponse } from "next/server";


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    
    const { accountId } = await req.json();

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home`, 
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });

  } catch (error) {
    console.error("Internal Server Error: ", error);
    return NextResponse.json(
      {error: {message: "Internal Server Error"}},
      {status: 500}
    )
  }
}
