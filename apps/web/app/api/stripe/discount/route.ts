import { NextRequest, NextResponse } from 'next/server';


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { discountCode, accountId, servicePrice } = await request
      .clone()
      .json();

    let discountAmount = 0;
    let discountDetails;

    // First try to find a promotion code by listing and filtering
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        limit: 100, // Adjust as needed
      }, {
        stripeAccount: accountId,
      });
      const matchingPromoCode = promotionCodes.data.find(
        promo => promo.code.toLowerCase() === discountCode.toLowerCase()
      );
      if (matchingPromoCode) {
        discountDetails = matchingPromoCode.coupon;
      } else {
        // If not found as promotion code, try as coupon
        try {
          discountDetails = await stripe.coupons.retrieve(discountCode, {
            stripeAccount: accountId,
          });
        } catch (innerError) {
          return NextResponse.json(
            { error: { message: 'Invalid discount code' } },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      return NextResponse.json(
        { error: { message: 'Error processing discount code' } },
        { status: 500 }
      );
    }

    if (discountDetails.amount_off) {
      // Fixed discount amount (in cents, Stripe uses smallest currency unit)
      discountAmount = discountDetails.amount_off / 100; // Convert to dollars if USD
    } else if (discountDetails.percent_off) {
      // Percentage discount
      discountAmount = (servicePrice * discountDetails.percent_off) / 100;
    }

    const response = {
      discountAmount: discountAmount,
      discountType: discountDetails.amount_off ? 'fixed' : 'percentage',
      discountDetails: discountDetails
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Internal Server Error: ', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 }
    );
  }
}