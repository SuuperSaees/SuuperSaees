import { Service } from '~/lib/services.types';
import convertToSubcurrency from '~/select-plan/components/convertToSubcurrency';
import { createClient } from '~/team-accounts/src/server/actions/clients/create/create-clients';
import { getUserByEmail } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import { getOrganizationById } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import { insertServiceToClientFromCheckout } from '~/team-accounts/src/server/actions/services/create/create-service';
import { deleteToken } from '~/team-accounts/src/server/actions/tokens/delete/delete-token';

type ValuesProps = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  state_province_region: string;
  postal_code: string;
  buying_for_organization: boolean;
  enterprise_name: string;
  tax_code: string;
  discount_coupon: string;
  card_name: string;
};

type HandlePaymentProps = {
  service: Service.Type;
  values: ValuesProps;
  stripeId: string;
  organizationId: string;
  paymentMethodId: string;
  coupon: string;
  tokenId: string;
};

export const handleRecurringPayment = async ({
  service,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  tokenId,
}: HandlePaymentProps) => {
  const res = await fetch('/api/stripe/subscription-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: convertToSubcurrency(service.price ?? 0),
      recurrence: true,
      email: values.email,
      priceId: service.price_id,
      accountId: stripeId,
      paymentMethodId,
      couponId: coupon,
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.clientSecret;
};

export const handleOneTimePayment = async ({
  service,
  values,
  stripeId,
  paymentMethodId,
  coupon,
  tokenId,
}: HandlePaymentProps) => {
  const res = await fetch('/api/stripe/unique-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: convertToSubcurrency(service.price ?? 0),
      email: values.email,
      currency: 'usd',
      accountId: stripeId,
      paymentMethodId,
      couponId: coupon,
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.clientSecret;
};

export const createClientAndAddService = async ({
  values,
  service,
  organizationId,
  tokenId,
}: {
  values: ValuesProps; // Replace with your form schema type
  service: Service.Type;
  organizationId: string;
  tokenId: string;
}) => {
  const newClient = {
    name: values.fullName,
    email: values.email,
    slug: values.enterprise_name ?? `${values.fullName}'s organization`,
  };

  const emailRevision = await getUserByEmail(values.email, true);

  if (emailRevision) {
    const client = emailRevision;
    const organizationData = await getOrganizationById(
      emailRevision.userData.organization_id ?? '',
      null,
      true,
    );
    await insertServiceToClientFromCheckout(
      organizationData.id,
      service.id,
      emailRevision.clientId.id ?? '',
      organizationId,
    );
    await deleteToken(tokenId);
    return client;
  }

  const client = await createClient({
    client: newClient,
    role: 'client_owner',
    agencyId: organizationId,
    adminActivated: true,
  });

  const organizationData = await getOrganizationById(
    client.organization_client_id,
    null,
    true,
  );

  await insertServiceToClientFromCheckout(
    organizationData.id,
    service.id,
    client.id ?? '',
    organizationId,
  );

  await deleteToken(tokenId);

  return client;
};

export const handleSubmitPayment = async ({
  service,
  values,
  stripeId,
  organizationId,
  paymentMethodId,
  coupon,
  tokenId,
}: HandlePaymentProps) => {
  try {
    const clientSecret = service.recurrence
      ? await handleRecurringPayment({
          service,
          values,
          stripeId,
          organizationId,
          paymentMethodId,
          coupon,
          tokenId,
        })
      : await handleOneTimePayment({
          service,
          values,
          stripeId,
          organizationId,
          paymentMethodId,
          coupon,
          tokenId,
        });

    if (clientSecret) {
      await createClientAndAddService({
        values,
        service,
        organizationId,
        tokenId,
      });
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
};
