import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, priceId, accountId, paymentMethodId, couponId } =
      await request.json();

    let customer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const existingCustomers = await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: accountId },
    );

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      customer = await stripe.customers.create(
        { email },
        { stripeAccount: accountId },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customer.id },
      { stripeAccount: accountId },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const coupon = await stripe.coupons.retrieve(couponId, {
          stripeAccount: accountId,
        });
        if (coupon.valid) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
      { error: { message: `Error: ${error.message}` } },
      { status: 500 },
    );
  }
}
