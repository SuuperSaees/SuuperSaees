import { NextRequest, NextResponse } from "next/server";



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { getDomainByUserId } from '~/multitenancy/utils/get/get-domain';



import { fetchCurrentUser } from '../../../../../../packages/features/team-accounts/src/server/actions/members/get/get-member-account';


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  const { accountId } = await req.clone().json();
  const supabase = getSupabaseServerComponentClient();
  const userData = await fetchCurrentUser(supabase);
  const userId = userData.id;

  const { domain: baseUrl } = await getDomainByUserId(userId, true);

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