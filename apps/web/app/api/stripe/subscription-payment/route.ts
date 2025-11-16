import { NextRequest, NextResponse } from 'next/server';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      serviceId,
      priceId,
      accountId,
      paymentMethodId,
      couponId,
      sessionId,
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

    let subscription = null;
    let discountDetails;

    if (couponId) {
      try {
        const promotionCodes = await stripe.promotionCodes.list({
          limit: 100, // Adjust as needed
        }, {
          stripeAccount: accountId,
        });
        const matchingPromoCode = promotionCodes.data.find(
          promo => promo.code === couponId.toUpperCase()
        );

        if (matchingPromoCode) {
          discountDetails = matchingPromoCode.coupon.id;
        } else {
          discountDetails = couponId;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const coupon = await stripe.coupons.retrieve(discountDetails, {
          stripeAccount: accountId,
        });
        if (coupon.valid) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          subscription = await stripe.subscriptions.create(
            {
              customer: customer.id,
              items: [{ price: priceId }],
              discounts: discountDetails ? [{ coupon: discountDetails }] : undefined,
              expand: ['latest_invoice.payment_intent'],
              metadata: { sessionId: sessionId },
            },
            { stripeAccount: accountId },
          );

          (async () => {
            const { data: checkoutSessionData, error: checkoutSessionError } =
              await supabase
                .from('checkouts')
                .insert({
                  provider: 'stripe',
                  provider_id: subscription.id,
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
            provider_id: subscription.id,
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

    return NextResponse.json({
      clientSecret: subscription.latest_invoice.payment_intent?.client_secret ?? '',
    });
  } catch (error) {
    console.error('Internal Server Error: ', error);
    return NextResponse.json(
      { error: { message: `Error: ${error.message}` } },
      { status: 500 },
    );
  }
}