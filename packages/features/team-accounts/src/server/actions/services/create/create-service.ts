'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Client } from '../../../../../../../../apps/web/lib/client.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { CustomError, CustomResponse, ErrorServiceOperations } from '../../../../../../../shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { fetchClientByOrgId } from '../../clients/get/get-clients';
import { fetchCurrentUser, getPrimaryOwnerId } from '../../members/get/get-member-account';
import { hasPermissionToAddClientServices } from '../../permissions/services';
import { createUrlForCheckout } from './create-token-for-checkout';
import { getStripeAccountID } from '../../members/get/get-member-account';
import { getOrganization } from '../../organizations/get/get-organizations';
import { RetryOperationService } from '@kit/shared/utils';
import { getDomainByOrganizationId } from '../../../../../../../multitenancy/utils/get/get-domain';
import { revalidatePath } from 'next/cache';


// import { updateTeamAccountStripeId } from '../../team-details-server-actions';

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
    currency: string;
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

    // const { userId, stripeId: stripeAccountId } = await getStripeAccountID();
    // let stripeId = stripeAccountId;
    const newService = {
      created_at: new Date().toISOString(),
      status: 'active' as Service.Type['status'],
      propietary_organization_id: primary_owner_user_id,
      number_of_clients: 0,
      single_sale: clientData.step_type_of_service.single_sale,
      recurring_subscription:
        clientData.step_type_of_service.recurring_subscription,
      service_image: clientData.step_service_details.service_image,
      name: clientData.step_service_details.service_name,
      currency: clientData.step_service_price.currency.toLowerCase(),
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
      visibility: 'public' as Service.Type['visibility'],
    };

    const { error, data: dataResponseCreateService } = await client
      .from('services')
      .insert(newService)
      .select()
      .single();

    if (error)
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        error.message,
        ErrorServiceOperations.FAILED_TO_CREATE_SERVICE,
      );

    const generateCheckoutUrlPromise = new RetryOperationService(
      async () => {
        const { stripeId } = await getStripeAccountID(primary_owner_user_id)
        const organization = await getOrganization()
        const baseUrl = await getDomainByOrganizationId(organization.id, true, true);

        const checkoutUrl = await createUrlForCheckout({
          stripeId: stripeId,
          priceId: '',
          service: dataResponseCreateService,
          organizationId: organization.id,
          baseUrl: baseUrl,
          primaryOwnerId: primary_owner_user_id,
        });

        // Actualizar el servicio con la URL generada
        const { error: errorUpdateService } = await client
          .from('services')
          .update({ checkout_url: checkoutUrl })
          .eq('id', dataResponseCreateService.id);

        if (errorUpdateService) {
          throw new Error(`Failed to update service with checkout URL: ${errorUpdateService.message}`);
        }

        return checkoutUrl;
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2,
      }
    );

    generateCheckoutUrlPromise.execute().catch((error) => {
      console.error('Failed to generate checkout URL:', error);
    });
    revalidatePath('/services');
    return CustomResponse.success(
      {
        supabase: dataResponseCreateService,
        // stripeProduct,
        // stripePrice,
      },
      'serviceCreated',
    ).toJSON();
  } catch (error) {
    console.error('Error to create service:', error);
    return CustomResponse.error(error).toJSON();
  }
};

// async function fetchUserAccount(client: SupabaseClient<Database>) {
//   const {
//     data: { user },
//     error,
//   } = await client.auth.getUser();
//   if (error) throw error;
//   return user;
// }

// async function createStripeAccount(email: string, userId: string) {
//   const { domain: baseUrl } = await getDomainByUserId(userId, true);

//   const response = await fetch(`${baseUrl}/api/stripe/create-account`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email }),
//   });
//   if (!response.ok) throw new Error('Failed to create Stripe account');
//   return response.json();
// }

// async function createStripeProduct(
//   accountId: string,
//   clientData: ServiceData,
//   userId: string,
// ) {
//   const { domain: baseUrl } = await getDomainByUserId(userId, true);
//   const response = await fetch(`${baseUrl}/api/stripe/create-service`, {
//     // Important: This endpoint is not used anymore.
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       accountId,
//       name: clientData.step_service_details.service_name,
//       description: clientData.step_service_details.service_description,
//       imageUrl: clientData.step_service_details.service_image,
//     }),
//   });
//   if (!response.ok) throw new Error('Failed to create Stripe product');
//   return response.json();
// }

// async function createStripePrice(
//   accountId: string,
//   productId: string,
//   clientData: ServiceData,
//   userId: string,
// ) {
//   const { domain: baseUrl } = await getDomainByUserId(userId, true);
//   const response = await fetch(`${baseUrl}/api/stripe/create-service-price`, {
//     // Important: This endpoint is not used anymore.
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       accountId,
//       productId,
//       unitAmount: clientData.step_service_price.price * 100,
//       currency: 'usd',
//       isRecurring: clientData.step_type_of_service.recurring_subscription,
//       interval: clientData.step_service_price.recurrence,
//     }),
//   });
//   if (!response.ok) throw new Error('Failed to create Stripe price');
//   return response.json();
// }

// async function updateServiceWithPriceId(
//   client: SupabaseClient<Database>,
//   serviceId: number,
//   priceId: string,
// ) {
  // const { error } = await client
  //   .from('services')
  //   .update({ price_id: priceId })
  //   .eq('id', serviceId);
  // if (error) throw new Error(error.message);
// }

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
    const clientData = await fetchClientByOrgId(client, clientOrganizationId);

    const clientId = clientData[0]?.id;
    const clientAgencyId = clientData[0]?.agency_id;

    if (!clientId || !clientAgencyId) throw new Error('No client found');

    // Step 3: Verify the permissions to add service to client
    const hasPermission =
      await hasPermissionToAddClientServices(clientAgencyId);

    if (!hasPermission)
      throw new CustomError(
        HttpStatus.Error.Unauthorized,
        'No permissions to add service to client',
        ErrorServiceOperations.INSUFFICIENT_PERMISSIONS,
      );

    // Step 4: Add to specified service to the client organization
    const serviceAddedData = await insertServiceToClient(
      client,
      clientOrganizationId,
      serviceId,
      clientId ?? '',
      user.id,
      clientAgencyId,
    );

    return CustomResponse.success(serviceAddedData, 'serviceAdded').toJSON();
  } catch (error) {
    console.error('Error while adding service to client', error);
    return CustomResponse.error(error).toJSON();
  }
}

export async function insertServiceToClient(
  client: SupabaseClient<Database>,
  clientOrganizationId: string,
  serviceId: Service.Type['id'],
  clientId: Client.Type['id'],
  userId: Account.Type['id'],
  agencyId: string,
) {
  try {
    const { data: serviceAddedData, error: serviceAddedError } = await client
      .from('client_services')
      .insert({
        client_organization_id: clientOrganizationId,
        service_id: serviceId,
        client_id: clientId,
        created_by: userId,
        agency_id: agencyId,
      })
      .select();

    if (serviceAddedError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error while trying to add service to client, ${serviceAddedError.message}`,
        ErrorServiceOperations.FAILED_TO_ADD_SERVICE,
      );
    }

    return serviceAddedData;
  } catch (error) {
    console.error('Error while adding service to client', error);
    throw error;
  }
}