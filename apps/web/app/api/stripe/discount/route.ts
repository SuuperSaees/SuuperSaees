import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { discountCode, accountId, servicePrice } = await request.json();

    const coupon = await stripe.coupons.retrieve(discountCode, {
      stripeAccount: accountId,
    });

    let discountAmount = 0;

    if (coupon.amount_off) {
      // Fixed discount amount (in cents, Stripe uses smallest currency unit)
      discountAmount = coupon.amount_off / 100; // Convert to dollars if USD
    } else if (coupon.percent_off) {
      // Percentage discount
      discountAmount = (servicePrice * coupon.percent_off) / 100;
    }

    return NextResponse.json({
      discountAmount: discountAmount,
    });
  } catch (error) {
    console.error('Internal Server Error: ', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}
