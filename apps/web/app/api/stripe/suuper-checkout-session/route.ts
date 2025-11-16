import { NextRequest, NextResponse } from "next/server";



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';



import { fetchCurrentUser } from '../../../../../../packages/features/team-accounts/src/server/actions/members/get/get-member-account';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const { priceId, customer, seats } = await req.clone().json();
  const supabase = getSupabaseServerComponentClient();
  const userData = await fetchCurrentUser(supabase);
  const userId = userData.id;

  const { domain: baseUrl } = await getDomainByUserId(userId, true);
  if (!priceId) {
    return NextResponse.json(
      { error: { message: 'Price ID is required' } },
      { status: 400 },
    );
  }

  if (!customer) {
    return NextResponse.json(
      { error: { message: 'Customer ID is required' } },
      { status: 400 },
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const price = await stripe.prices.retrieve(priceId);

    const { type } = price;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      customer,
      mode: type === 'recurring' ? 'subscription' : 'payment',
      success_url: `${baseUrl}home/settings?checkout=success`,
      cancel_url: `${baseUrl}home/settings?checkout=cancel`,
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