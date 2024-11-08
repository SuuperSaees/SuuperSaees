import { NextRequest, NextResponse } from 'next/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, priceId, accountId, paymentMethodId, couponId } =
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

    let subscription = null;

    if (couponId) {
      try {
        const coupon = await stripe.coupons.retrieve(couponId, {
          stripeAccount: accountId,
        });
        if (coupon.valid) {
          subscription = await stripe.subscriptions.create(
            {
              customer: customer.id,
              items: [{ price: priceId }],
              discounts: couponId ? [{ coupon: couponId }] : undefined,
              expand: ['latest_invoice.payment_intent'],
            },
            { stripeAccount: accountId },
          );

          return NextResponse.json({
            clientSecret:
              subscription.latest_invoice.payment_intent.client_secret,
          });
        } else {
          return NextResponse.json(
            { error: { message: 'Invalid or expired discount code' } },
            { status: 400 },
          );
        }
      } catch (error) {
        console.error('Error retrieving coupon:', error);
        return NextResponse.json(
          { error: { message: 'Invalid or expired discount code' } },
          { status: 400 },
        );
      }
    }

    subscription = await stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
      },
      { stripeAccount: accountId },
    );

    return NextResponse.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Internal Server Error: ', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}
