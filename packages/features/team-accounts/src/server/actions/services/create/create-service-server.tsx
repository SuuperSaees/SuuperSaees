'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const createService = async (clientData: {
  step_type_of_service : {
    single_sale: boolean,
    recurring_subscription: boolean,
  },
  step_service_details: {
      service_image: string,
      service_name: string,
      service_description: string,
  },
  step_service_price: {
      standard: boolean,
      purchase_limit: number,
      allowed_orders: number,
      time_based: boolean,
      hours: number,
      credit_based: boolean,
      credits: number,
      price: number,
      recurrence: string,
      test_period: boolean,
      test_period_duration: number,
      test_period_duration_unit_of_measurement: string,
      test_period_price: number,
      max_number_of_simultaneous_orders: number,
      max_number_of_monthly_orders: number,
  },
}) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData } = await client.auth.getUser();
    const { data: organizationData} = await client.from('accounts').select().eq('primary_owner_user_id', userData.user!.id);
    const filteredAccounts = organizationData?.filter(account => account.id !== userData.user!.id);
    const organizationIds = filteredAccounts?.map(account => account.id) ?? []; 
    const primary_owner_user_id = organizationIds[0] ?? '';
    console.log('userData', primary_owner_user_id);

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
      max_number_of_monthly_orders: clientData.step_service_price.max_number_of_monthly_orders
    };

    const { error } = await client
      .from('services')
      .insert(newService);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el servicio:', error);
  }
};


