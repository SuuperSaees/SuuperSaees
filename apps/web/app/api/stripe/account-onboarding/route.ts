import { NextRequest, NextResponse } from "next/server";



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getDomainByUserId } from '~/multitenancy/utils/get-domain-by-user-id';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const { accountId } = await req.json();
  const supabase = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;
  const userId = userData?.user.id;

  const baseUrl = await getDomainByUserId(userId, true);

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/home`,
      return_url: `${baseUrl}/home`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Internal Server Error: ', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}