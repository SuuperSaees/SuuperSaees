import { NextRequest, NextResponse } from "next/server";



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getDomainByUserId } from '~/multitenancy/utils/get-domain-by-user-id';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const { priceId, stripeId } = await req.json();
  const supabase = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;
  const userId = userData?.user.id;

  const baseUrl = await getDomainByUserId(userId, true);

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

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}