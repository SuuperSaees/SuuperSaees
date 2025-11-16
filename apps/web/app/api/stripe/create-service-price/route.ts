import { NextRequest, NextResponse } from "next/server";



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Definición de tipos para los datos entrantes
interface PriceRequest {
  accountId: string;
  productId: string;
  unitAmount: number;
  serviceId: number;
  currency: string;
  isRecurring: boolean;
  interval?: 'day' | 'week' | 'month' | 'year';
  type: 'create' | 'update';
}

export async function POST(req: NextRequest) {
  const {
    accountId,
    productId,
    unitAmount,
    serviceId,
    currency,
    isRecurring,
    interval,
    type,
  }: PriceRequest = await req.json();

  try {
    const priceData: {
      product: string;
      unit_amount: number;
      currency: string;
      recurring?: {
        interval: 'day' | 'week' | 'month' | 'year';
      };
    } = {
      product: productId,
      unit_amount: unitAmount,
      currency: currency,
    };

    if (isRecurring && interval) {
      priceData.recurring = {
        interval: interval,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const price = await stripe.prices.create(priceData, {
      stripeAccount: accountId,
    });

    const supabaseClient = getSupabaseServerComponentClient({
      admin: true,
    });
    const { error } = await supabaseClient
      .from('services')
      .update({ price_id: price.id })
      .eq('id', serviceId);

    if (error) {
      console.error('Error updating service:', error);
    }

    if (type === 'create') {
      const { error: errorCreateBillingService } = await supabaseClient
        .from('billing_services')
        .insert({
          service_id: serviceId,
          provider: 'stripe',
          provider_id: price.id,
          status: 'active',
        });
      if (errorCreateBillingService) {
        console.error(
          'Error creating billing service:',
          errorCreateBillingService,
        );
      }
    } else {
      const { error: errorUpdateBillingService } = await supabaseClient
        .from('billing_services')
        .update({
          provider_id: price.id,
        })
        .eq('service_id', serviceId);

      if (errorUpdateBillingService) {
        console.error(
          'Error updating billing service:',
          errorUpdateBillingService,
        );
      }
    }

    return NextResponse.json({ priceId: price.id });
  } catch (error) {
    console.error('Error creating price:', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error' } },
      { status: 500 },
    );
  }
}