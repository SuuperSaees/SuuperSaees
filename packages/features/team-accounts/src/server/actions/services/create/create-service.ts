'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Service } from '../../../../../../../../apps/web/lib/services.types';
import {
  fetchCurrentUser,
  getPrimaryOwnerId,
  getStripeAccountID,
} from '../../members/get/get-member-account';
import { updateTeamAccountStripeId } from '../../team-details-server-actions';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface ServiceData {
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
}

export const createService = async (clientData: ServiceData) => {
  const client = getSupabaseServerComponentClient();

  try {
    const primary_owner_user_id = await getPrimaryOwnerId();
    if (!primary_owner_user_id) throw new Error('No primary owner found');

    let stripe_account_id = (await getStripeAccountID()) as string;

    const newService = {
      created_at: new Date().toISOString(),
      status: 'active',
      propietary_organization_id: primary_owner_user_id,
      number_of_clients: 0,
      single_sale: clientData.step_type_of_service.single_sale,
      recurring_subscription:
        clientData.step_type_of_service.recurring_subscription,
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
      test_period_duration_unit_of_measurement:
        clientData.step_service_price.test_period_duration_unit_of_measurement,
      test_period_price: clientData.step_service_price.test_period_price,
      max_number_of_simultaneous_orders:
        clientData.step_service_price.max_number_of_simultaneous_orders,
      max_number_of_monthly_orders:
        clientData.step_service_price.max_number_of_monthly_orders,
    };

    const { error, data: dataResponseCreateService } = await client
      .from('services')
      .insert(newService)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (!stripe_account_id) {
      const user = await fetchUserAccount(client);
      const stripeAccount = await createStripeAccount('');
      await updateTeamAccountStripeId({
        stripe_id: stripeAccount.accountId,
        id: user?.id as string,
      });
      stripe_account_id = stripeAccount.accountId;
    }
    const stripeProduct = await createStripeProduct(
      stripe_account_id,
      clientData,
    );
    const stripePrice = await createStripePrice(
      stripe_account_id,
      stripeProduct.productId,
      clientData,
    );

    await updateServiceWithPriceId(
      client,
      dataResponseCreateService.id,
      stripePrice.priceId,
    );

    return {
      supabase: dataResponseCreateService,
      stripeProduct,
      stripePrice,
    };
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    throw error;
  }
};

async function fetchUserAccount(client) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error) throw error;
  return user;
}

async function createStripeAccount(email: string) {
  const response = await fetch(`${baseUrl}/api/stripe/create-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error('Failed to create Stripe account');
  return response.json();
}

async function createStripeProduct(accountId: string, clientData: ServiceData) {
  const response = await fetch(`${baseUrl}/api/stripe/create-service`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      name: clientData.step_service_details.service_name,
      description: clientData.step_service_details.service_description,
      imageUrl: clientData.step_service_details.service_image,
    }),
  });
  if (!response.ok) throw new Error('Failed to create Stripe product');
  return response.json();
}

async function createStripePrice(
  accountId: string,
  productId: string,
  clientData: ServiceData,
) {
  const response = await fetch(`${baseUrl}/api/stripe/create-service-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      productId,
      unitAmount: clientData.step_service_price.price * 100,
      currency: 'usd',
      isRecurring: clientData.step_type_of_service.recurring_subscription,
      interval: clientData.step_service_price.recurrence,
    }),
  });
  if (!response.ok) throw new Error('Failed to create Stripe price');
  return response.json();
}

async function updateServiceWithPriceId(
  client,
  serviceId: number,
  priceId: string,
) {
  const { error } = await client
    .from('services')
    .update({ price_id: priceId })
    .eq('id', serviceId);
  if (error) throw new Error(error.message);
}

export async function addServiceToClient(
  clientOrganizationId: string,
  serviceId: Service.Type['id'],
) {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Getting the client identifier

    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('id')
      .eq('organization_client_id', clientOrganizationId);

    if (clientError)
      throw new Error(
        `Error while trying to find the client, ${clientError.message}`,
      );

    const clientId = clientData[0]?.id;
    if (!clientId) throw new Error('No client found');

    // Step 3: Add to specified service to the client organization
    const { data: serviceAddedData, error: serviceAddedError } = await client
      .from('client_services')
      .insert({
        client_organization_id: clientOrganizationId,
        service_id: serviceId,
        client_id: clientId,
        created_by: user.id,
      })
      .select();

    // Step 4: Update service clients count
    // const { error: updateServiceError } = await client
    //   .from('services')
    //   .update({ number_of_clients: 1})
    //   .increment('number_of_clients')

    if (serviceAddedError)
      throw new Error(
        `Error while trying to add service to client, ${serviceAddedError.message}`,
      );
    revalidatePath(`/clients/organizations`);
    return serviceAddedData;
  } catch (error) {
    console.error('Error while adding service to client', error);
    throw error;
  }
}

export async function getClientServices(clientOrganizationId: string) {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Get the client's service
    const { data: clientServiceData, error: clientServiceError } = await client
      .from('client_services')
      .select(
        'id, created_at, info:services(id, name, price, service_description, service_image)',
      )
      .eq('client_organization_id', clientOrganizationId);

    if (clientServiceError) {
      throw new Error(
        `Error while getting client services, ${clientServiceError.message}`,
      );
    }
    console.log('clienServicetData', clientServiceData);

    return clientServiceData;
  } catch (error) {
    console.error('Error while getting client services', error);
    throw error;
  }
}

export async function deleteClientService(
  clientOrganizationId: string,
  serviceId: Service.Type['id'],
) {
  const client = getSupabaseServerComponentClient();
  try {
    // Step 1: Verify the user
    const user = await fetchCurrentUser(client);
    if (!user) throw new Error('No user found');

    // Step 2: Get the client ID
    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('id')
      .eq('organization_client_id', clientOrganizationId);

    if (clientError)
      throw new Error(
        `Error while trying to find the client, ${clientError.message}`,
      );

    const clientId = clientData[0]?.id;
    if (!clientId) throw new Error('No client found');

    // Step 3: Delete the specified service from the client organization
    const { data: deleteData, error: deleteError } = await client
      .from('client_services')
      .delete()
      .eq('client_organization_id', clientOrganizationId)
      .eq('service_id', serviceId)
      .eq('client_id', clientId);

    if (deleteError)
      throw new Error(
        `Error while trying to delete service from client, ${deleteError.message}`,
      );

    // Step 4: Optionally, you can revalidate the path or update the number of clients
    revalidatePath(`/clients/`);

    return deleteData;
  } catch (error) {
    console.error('Error while deleting service from client', error);
    throw error;
  }
}