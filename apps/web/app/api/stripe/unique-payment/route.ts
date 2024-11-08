import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, amount, currency, accountId, paymentMethodId, couponId } =
      await request.json();
    let customer;
    const existingCustomers = await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: accountId },
    );

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create(
        { email },
        { stripeAccount: accountId },
      );
    }

    await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customer.id },
      { stripeAccount: accountId },
    );
    await stripe.customers.update(
      customer.id,
      {
        invoice_settings: { default_payment_method: paymentMethodId },
      },
      { stripeAccount: accountId },
    );

    let finalAmount = amount;
    if (couponId) {
      try {
        const coupon = await stripe.coupons.retrieve(couponId, {
          stripeAccount: accountId,
        });
        if (coupon.valid) {
          if (coupon.amount_off) {
            finalAmount = amount - coupon.amount_off;
          } else if (coupon.percent_off) {
            finalAmount =
              amount - Math.round((amount * coupon.percent_off) / 100);
          }
        }
      } catch (error) {
        console.error('Error retrieving coupon:', error);
        return NextResponse.json(
          { error: { message: 'Invalid or expired discount code' } },
          { status: 400 },
        );
      }
    }

    finalAmount = Math.max(finalAmount, 0);

    const paymentIntent = await stripe.paymentIntents.create(
      {
        customer: customer.id,
        amount: finalAmount,
        currency,
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      },
      { stripeAccount: accountId },
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: { message: error } }, { status: 500 });
  }
}
