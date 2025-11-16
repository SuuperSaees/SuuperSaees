import { NextRequest, NextResponse } from 'next/server';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      amount,
      currency,
      accountId,
      paymentMethodId,
      couponId,
      serviceId,
      sessionId,
      quantity,
      trialPeriodDays,
    } = await request.clone().json();

    const supabase = getSupabaseServerComponentClient(
      { admin: true },
    );

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

    let finalAmount = amount * quantity;
    if (couponId) {
      try {
        let discountDetails;
        let discountType = '';

        // Determine if the code format matches a promotion code or coupon
        const isPromotionCodeFormat = /^[A-Za-z0-9]{8,}$/.test(couponId);
        
        if (isPromotionCodeFormat) {
          // Try promotion code first
          const promotionCodes = await stripe.promotionCodes.list({
            limit: 100,
            code: couponId.toUpperCase(),
          }, {
            stripeAccount: accountId,
          });

          if (promotionCodes.data.length > 0) {
            discountType = 'promotion';
            discountDetails = promotionCodes.data[0].coupon;
          }
        }

        // If not found as promotion code or format doesn't match, try as coupon
        if (!discountDetails) {
          discountDetails = await stripe.coupons.retrieve(couponId, {
            stripeAccount: accountId,
          });
          discountType = 'coupon';
        }

        if (discountDetails.valid) {
          if (discountDetails.amount_off) {
            finalAmount = (amount * quantity) - discountDetails.amount_off;
          } else if (discountDetails.percent_off) {
            finalAmount =
            (amount * quantity) - Math.round(((amount * quantity) * discountDetails.percent_off) / 100);
          }
        }
      } catch (error) {
        console.error('Error retrieving discount:', error);
        return NextResponse.json(
          { error: { message: 'Invalid or expired discount code' } },
          { status: 400 },
        );
      }
    }

    finalAmount = Math.max(finalAmount, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
        metadata: { sessionId: sessionId },
        ...(trialPeriodDays ? { trial_period_days: trialPeriodDays } : {}),
      },
      { stripeAccount: accountId },
    );

    (async () => {
      const { data: checkoutSessionData, error: checkoutSessionError } =
        await supabase
          .from('checkouts')
          .insert({
            provider: 'stripe',
            provider_id: paymentIntent.id,
          })
          .select('id')
          .single();

      if (checkoutSessionError) {
        console.error('Error creating checkout session:', checkoutSessionError);
      }

      const { error: checkoutServiceError } = await supabase
        .from('checkout_services')
        .insert({
          checkout_id: checkoutSessionData?.id,
          service_id: serviceId,
        })
        .single();

      if (checkoutServiceError) {
        console.error('Error creating checkout service:', checkoutServiceError);
      }
    })().catch((error) => {
      console.error('Error creating checkout session:', error);
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json(
      { error: { message: `Error: ${error.message}` } }, 
      { status: 500 }
    );
  }
}