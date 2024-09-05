'use server';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getPrimaryOwnerId, getStripeAccountID } from '../../members/get/get-member-account';
import { updateTeamAccountStripeId } from '../../team-details-server-actions';

export const createService = async (clientData: {
  step_type_of_service: {
    single_sale: boolean;
    recurring_subscription: boolean;
  };
  step_service_details: {
    service_image: string;
    service_name: string;
    service_description: string;
  };
  step_service_price: {
    standard: boolean;
    purchase_limit: number;
    allowed_orders: number;
    time_based: boolean;
    hours: number;
    credit_based: boolean;
    credits: number;
    price: number;
    recurrence: string;
    test_period: boolean;
    test_period_duration: number;
    test_period_duration_unit_of_measurement: string;
    test_period_price: number;
    max_number_of_simultaneous_orders: number;
    max_number_of_monthly_orders: number;
  };
}) => {
  try{
    const client = getSupabaseServerComponentClient();
 
    const primary_owner_user_id = await getPrimaryOwnerId()
    if (!primary_owner_user_id) throw new Error('No primary owner found');

    let stripe_account_id = await getStripeAccountID();
    if (!stripe_account_id) throw new Error('No stripe account found');

    const newService = {
      created_at: new Date().toISOString(),
      status: 'active',
      propietary_organization_id: primary_owner_user_id,
      number_of_clients: 0,
      single_sale: clientData.step_type_of_service.single_sale,
      recurring_subscription: clientData.step_type_of_service.recurring_subscription,
      service_image: clientData.step_service_details.service_image,
      name: clientData.step_service_details.service_name,
      service_description: clientData.step_service_details.service_description,
      standard: clientData.step_service_price.standard,
      purchase_limit: clientData.step_service_price.purchase_limit,
      allowed_orders: clientData.step_service_price.allowed_orders,
      time_based: clientData.step_service_price.time_based,
      hours: clientData.step_service_price.hours,
      credit_based: clientData.step_service_price.credit_based,
      credits: clientData.step_service_price.credits,
      price: clientData.step_service_price.price,
      recurrence: clientData.step_service_price.recurrence,
      test_period: clientData.step_service_price.test_period,
      test_period_duration: clientData.step_service_price.test_period_duration,
      test_period_duration_unit_of_measurement: clientData.step_service_price.test_period_duration_unit_of_measurement,
      test_period_price: clientData.step_service_price.test_period_price,
      max_number_of_simultaneous_orders: clientData.step_service_price.max_number_of_simultaneous_orders,
      max_number_of_monthly_orders: clientData.step_service_price.max_number_of_monthly_orders,
    };
    
    // Inserta en Supabase
    const { error, data: dataResponseCreateService } = await client
      .from('services')
      .insert(newService)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Si se inserta correctamente en Supabase, procede a crear el servicio en Stripe
    const fetchUserAccount = async () => {
      const { data: {user}, error: userAccountError } = await client.auth.getUser();
     
      if (userAccountError) console.error(userAccountError.message);
      return user
    }

    if (!stripe_account_id) {
      let user;
    void fetchUserAccount().then((data)=> {
      user= data
    }).then(()=> {
        fetch("/api/stripe/create-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: user?.email }),
        })
        .then((res) => res.json())
        .then(async (data) => {
          // SAVE OR UPDATE ACCOUNT ID
          stripe_account_id = data.accountId
          await updateTeamAccountStripeId({
            stripe_id: data.accountId as string,
            id: user?.id as string
          })
            }).catch((error) => {
                console.log(error)
            });
          })
      }

    const stripeResponse = await fetch(`${baseUrl}/api/stripe/create-service`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accountId: stripe_account_id,
        name: clientData.step_service_details.service_name,
        description: clientData.step_service_details.service_description,
        imageUrl: clientData.step_service_details.service_image,
      }),
    });

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      throw new Error(`Stripe error: ${stripeData.error}`);
    }

    const unitAmount = clientData.step_service_price.price * 100; 
    const currency = 'usd'; 
    const stripePriceResponse = await fetch(`${baseUrl}/api/stripe/create-service-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accountId: stripe_account_id,
        productId: stripeData.productId,
        unitAmount: unitAmount,
        currency: currency,
        isRecurring: clientData.step_type_of_service.recurring_subscription,
        interval: clientData.step_service_price.recurrence,
      }),
    });

    const stripePriceData = await stripePriceResponse.json();

    if (!stripePriceResponse.ok) {
      throw new Error(`Stripe error: ${stripePriceData.error.message}`);
    }

    const {error: errorResponseUpdateService} = await client
    .from('services')
    .update({price_id: stripePriceData?.priceId})
    .eq('id', dataResponseCreateService.id);

  if (errorResponseUpdateService) {
    throw new Error(errorResponseUpdateService?.message);
  }

    return {
      supabase: dataResponseCreateService,
      stripeProduct: stripeData,
      stripePrice: stripePriceData
    };

  } catch (error) {
    console.error('Error al crear el servicio:', error);
    throw error;
  }
};
