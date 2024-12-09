import { NextRequest, NextResponse } from "next/server";



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const { priceId, stripeId, serviceId } = await req.clone().json();
  const supabase = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;
  const userId = userData?.user.id;

  const { domain: baseUrl } = await getDomainByUserId(userId, true);

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const price = await stripe.prices.retrieve(priceId, {
      stripeAccount: stripeId,
    });

    const { type } = price;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: type === 'recurring' ? 'subscription' : 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      },
      {
        stripeAccount: stripeId,
      },
    );

    (async () => {
      const { data: checkoutSessionData, error: checkoutSessionError } =
        await supabase
          .from('checkouts')
          .insert({
            provider: 'stripe',
            provider_id: session.id,
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

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}