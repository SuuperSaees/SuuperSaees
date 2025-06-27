import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { BillingAccounts } from '../../../../../../../apps/web/lib/billing-accounts.types';
import { Database } from '../../../../../../../apps/web/lib/database.types';
import { Service } from '../../../../../../../apps/web/lib/services.types';
import { Subscription } from '../../../../../../../apps/web/lib/subscriptions.types';
import { Checkout } from '../../../../../../../apps/web/lib/checkout.types';
import { Activity } from '../../../../../../../apps/web/lib/activity.types';
import { getSessionById } from '../../../../../../features/team-accounts/src/server/actions/sessions/get/get-sessions';
import { createClient } from '../../../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { insertServiceToClient } from '../../../../../../features/team-accounts/src/server/actions/services/create/create-service';
import { createBillingGatewayService } from '../billing-gateway/billing-gateway.service';
import { ActivityService } from '../../../../../../webhooks/src/server/services/shared/activity.service';
import { Session } from '../../../../../../../apps/web/lib/sessions.types';
import { Invoice } from '../../../../../../../apps/web/lib/invoice.types';
import { createUrlForCheckout } from '../../../../../../features/team-accounts/src/server/actions/services/create/create-token-for-checkout';
import { RetryOperationService } from '@kit/shared/utils';
import { InvoiceSettingsWebhookHelper } from '../../../../../../webhooks/src/server/services/shared/invoice-settings-webhook.helper';

export function createBillingWebhooksService(
  adminClient: SupabaseClient<Database>,
  baseUrl: string,
) {
  return new BillingWebhooksService(adminClient, baseUrl);
}

/**
 * @name BillingWebhooksService
 * @description Service for handling billing webhooks.
 */
class BillingWebhooksService {
  private readonly ClientRoleManualPayment = 'client_owner';
  private readonly activityService: ActivityService;
  private readonly invoiceSettingsHelper: InvoiceSettingsWebhookHelper;

  constructor(
    private readonly adminClient: SupabaseClient<Database>,
    private readonly baseUrl: string,
  ) {
    this.activityService = new ActivityService(adminClient);
    this.invoiceSettingsHelper = new InvoiceSettingsWebhookHelper(adminClient);
  }

  /**
   * @name handleCheckoutCreatedWebhook
   * @description Handles the webhook for when a checkout is created with manual payment.
   * @param checkout
   */
  async handleCheckoutCreatedWebhook(checkout: Checkout.Type) {
    try {
      // Only process if the provider is 'suuper'
      if (checkout.provider !== 'suuper') {
        console.log(
          `Checkout provider is ${checkout.provider}, not processing manual payment logic`,
        );
        return;
      }

      console.log('Processing manual payment checkout:', checkout.id);

      // 1. Get the session by provider_id
      const session = await getSessionById(checkout.provider_id);

      if (!session) {
        throw new Error(`Session not found for provider_id: ${checkout.provider_id}`);
      }

      // Check metadata type to determine if we should create a client or just process payment
      const sessionMetadata = session.metadata as { type?: string; quantity?: number };
      const sessionType = sessionMetadata?.type;

      console.log('Session type from metadata:', sessionType);

      // If it's an invoice payment, only update the payment, don't create client
      if (sessionType === 'invoice') {
        console.log('Invoice payment detected, processing payment only (no client creation)');
        
        // For invoice payments, we just need to update the invoice payment status
        // The client and invoice should already exist
        // TODO: Add invoice payment processing logic here if needed
        console.log('Invoice payment processed for session:', checkout.provider_id);
        
        // Mark the session as deleted
        await this.adminClient
          .from('sessions')
          .update({
            deleted_on: new Date().toISOString(),
          })
          .eq('id', checkout.provider_id);
          
        return {
          success: true,
          type: 'invoice_payment',
          sessionId: checkout.provider_id,
        };
      }

      // Continue with service flow (create client if needed)
      if (sessionType !== 'service') {
        console.warn(`Unknown session type: ${sessionType}, proceeding with service flow as fallback`);
      }

      // 2. Get the service associated with the checkout
      const { data: checkoutServiceData, error: checkoutServiceError } =
        await this.adminClient
          .from('checkouts')
          .select(
            'id, checkout_services(service_id, services(name, propietary_organization_id, price, currency, recurring_subscription))',
          )
          .eq('id', checkout.id)
          .single();

      if (checkoutServiceError) {
        console.error('Error fetching checkout service:', checkoutServiceError);
        throw checkoutServiceError;
      }

      if (!checkoutServiceData?.checkout_services?.[0]) {
        throw new Error(`No service found for checkout: ${checkout.id}`);
      }

      const serviceData = checkoutServiceData.checkout_services[0];
      const serviceId = serviceData.service_id;
      const serviceName = serviceData.services?.name;
      const agencyOwnerId = serviceData.services?.propietary_organization_id;
      const servicePrice = serviceData.services?.price ?? 0;
      const serviceCurrency = serviceData.services?.currency ?? 'USD';
      const isRecurring = serviceData.services?.recurring_subscription ?? false;

      // 3. Get agency information
      const { data: accountDataAgencyOwnerData, error: accountDataAgencyOwnerError } =
        await this.adminClient
          .from('accounts')
          .select('id, organizations(id)')
          .eq('id', agencyOwnerId ?? '')
          .single();

      if (accountDataAgencyOwnerError) {
        console.error('Error fetching agency account:', accountDataAgencyOwnerError);
        throw accountDataAgencyOwnerError;
      }

      const createdBy = accountDataAgencyOwnerData?.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const organizations = accountDataAgencyOwnerData?.organizations as any;
      const agencyOrganizationId = Array.isArray(organizations)
        ? organizations[0]?.id
        : organizations?.id;

      // 4. Prepare client data
      const newClient = {
        email: session.client_email ?? '',
        slug: `${session.client_name}'s Organization`,
        name: session.client_name ?? '',
      };

      // 5. Verify if the client already exists
      const { data: accountClientData, error: accountClientError } =
        await this.adminClient
          .from('accounts')
          .select('id')
          .eq('email', newClient.email ?? '')
          .single();

      if (accountClientError && accountClientError.code !== 'PGRST116') {
        console.error('Error fetching user account:', accountClientError);
      }

      let client;
      let clientOrganizationId;
      let clientId;

      // 6. Create client if not exists
      if (!accountClientData) {
        client = await createClient({
          client: newClient,
          role: this.ClientRoleManualPayment,
          agencyId: agencyOrganizationId ?? '',
          adminActivated: true,
        });

        clientOrganizationId = client?.success?.data?.organization_client_id;
        clientId = client?.success?.data?.id;
      } else {
        // 7. If client exists, fetch or create client relationship
        const { data: clientData, error: clientError } = await this.adminClient
          .from('clients')
          .select('id, organization_client_id')
          .eq('user_client_id', accountClientData.id)
          .eq('agency_id', agencyOrganizationId ?? '')
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          console.error('Error fetching client:', clientError);
        }

        if (clientData) {
          clientId = clientData.id;
          clientOrganizationId = clientData.organization_client_id;
        } else {
          // Create client-agency relationship if not exists
          const { data: createClientData, error: createClientError } =
            await this.adminClient
              .from('clients')
              .insert({
                agency_id: agencyOrganizationId ?? '',
                organization_client_id: clientOrganizationId ?? '',
                user_client_id: accountClientData.id,
              })
              .select('id, organization_client_id')
              .single();

          if (createClientError) {
            console.error('Error creating client relationship:', createClientError);
            throw createClientError;
          }

          clientId = createClientData?.id;
          clientOrganizationId = createClientData?.organization_client_id;
        }
      }

      // 8. Assign the service to the client
      await insertServiceToClient(
        this.adminClient,
        clientOrganizationId ?? '',
        serviceId ?? 0,
        clientId ?? '',
        createdBy ?? '',
        agencyOrganizationId ?? '',
      );

      const paymentMetadata = session.metadata as { quantity?: number };

      // 9. Generate invoice, invoice items and invoice payment for manual payment
      await this.handleManualPaymentInvoiceGeneration({
        session: session as Session.Type,
        agencyOrganizationId: agencyOrganizationId ?? '',
        clientOrganizationId: clientOrganizationId ?? '',
        userClientId: accountClientData?.id ?? client?.success?.data?.user_client_id ?? '',
        serviceId: serviceId ?? 0,
        serviceName: serviceName ?? '',
        servicePrice,
        serviceCurrency,
        isRecurring,
        checkoutServiceQuantity: paymentMetadata?.quantity ?? 1,
      });

      // 10. Mark the session as deleted
      await this.adminClient
        .from('sessions')
        .update({
          deleted_on: new Date().toISOString(),
        })
        .eq('id', checkout.provider_id);

      console.log('Manual payment checkout processed successfully:', {
        checkoutId: checkout.id,
        clientId,
        serviceId,
        sessionId: checkout.provider_id,
      });

      return {
        success: true,
        checkoutId: checkout.id,
        clientId,
        serviceId,
        clientOrganizationId,
      };
    } catch (error) {
      console.error('Error handling checkout created webhook:', error);
      throw error;
    }
  }

  /**
   * @name handleManualPaymentInvoiceGeneration
   * @description Generates invoice, invoice items and invoice payment for manual payments
   */
  private async handleManualPaymentInvoiceGeneration({
    session,
    agencyOrganizationId,
    clientOrganizationId,
    userClientId,
    serviceId,
    serviceName,
    servicePrice,
    serviceCurrency,
    isRecurring,
    checkoutServiceQuantity,
  }: {
    session: Session.Type;
    agencyOrganizationId: string;
    clientOrganizationId: string;
    userClientId: string;
    serviceId: number;
    serviceName: string;
    servicePrice: number;
    serviceCurrency: string;
    isRecurring: boolean;
    checkoutServiceQuantity: number;
  }) {
    try {
      console.log('Generating manual payment invoice for session:', session.id);

      // Parse metadata to get payment details
      let metadata = {
        quantity: 1,
        manual_payment_info: '',
        discount_coupon: '',
      };
      if (session.metadata) {
        try {
          metadata = typeof session.metadata === 'string' 
            ? JSON.parse(session.metadata) 
            : session.metadata;
        } catch (error) {
          console.warn('Error parsing session metadata:', error);
          metadata = {
            quantity: 1,
            manual_payment_info: '',
            discount_coupon: '',
          };
        }
      }

      // Get quantity from metadata or use checkout service quantity
      const quantity = metadata.quantity ?? checkoutServiceQuantity ?? 1;
      const manualPaymentInfo = metadata.manual_payment_info;
      const discountCoupon = metadata.discount_coupon;

      // Calculate amounts
      const unitPrice = servicePrice;
      const subtotalAmount = unitPrice * quantity;
      const taxAmount = 0; // You can add tax calculation logic here if needed
      const totalAmount = subtotalAmount + taxAmount;

      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Prepare invoice data
      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
      const invoiceData: Invoice.Insert = {
        agency_id: agencyOrganizationId,
        client_organization_id: clientOrganizationId,
        number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate as string,
        status: 'paid' as const, // Manual payments are marked as paid immediately
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: serviceCurrency.toUpperCase(),
        notes: this.buildInvoiceNotes({
          serviceName,
          isRecurring,
          clientName: session.client_name ?? '',
          clientEmail: session.client_email ?? '',
          manualPaymentInfo,
          discountCoupon,
        }),
      };

      // Create the invoice
      const { data: createdInvoice, error: invoiceError } = await this.adminClient
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) {
        throw new Error(`Failed to create invoice: ${invoiceError.message}`);
      }

      console.log('Invoice created successfully:', createdInvoice.id);

      // Create invoice items
      const invoiceItemData = {
        invoice_id: createdInvoice.id,
        service_id: serviceId,
        description: this.buildItemDescription(serviceName, isRecurring),
        quantity: quantity,
        unit_price: unitPrice,
        total_price: subtotalAmount,
      };

      const { error: itemsError } = await this.adminClient
        .from('invoice_items')
        .insert(invoiceItemData);

      if (itemsError) {
        console.error('Error creating invoice items:', itemsError);
        throw new Error(`Failed to create invoice items: ${itemsError.message}`);
      }

      console.log('Invoice items created successfully');

      // Create invoice_settings for both agency and client organizations
      try {
        const invoiceSettings = await this.invoiceSettingsHelper.createInvoiceSettingsForWebhook(
          createdInvoice.id,
          agencyOrganizationId,
          clientOrganizationId,
          {
            client_name: session.client_name ?? undefined,
            client_email: session.client_email ?? undefined,
            client_address: session.client_address ?? undefined,
            client_city: session.client_city ?? undefined,
            client_country: session.client_country ?? undefined,
            client_state: session.client_state ?? undefined,
            client_postal_code: session.client_postal_code ?? undefined,
            metadata: session.metadata,
          }
        );
        console.log(`Created ${invoiceSettings.length} invoice settings for manual payment invoice ${createdInvoice.id}`);
      } catch (error) {
        console.error('Error creating invoice settings for manual payment:', error);
      }

      // Record the manual payment
      const paymentData = {
        invoice_id: createdInvoice.id,
        payment_method: 'manual' as const,
        amount: totalAmount,
        status: 'succeeded' as const,
        processed_at: new Date().toISOString(),
        notes: this.buildPaymentNotes({
          serviceName,
          manualPaymentInfo,
          discountCoupon,
        }),
      };

      const { error: paymentError } = await this.adminClient
        .from('invoice_payments')
        .insert(paymentData);

      if (paymentError) {
        console.error('Error recording manual payment:', paymentError);
        throw new Error(`Failed to record manual payment: ${paymentError.message}`);
      }

      console.log('Manual payment recorded successfully');

      // Generate checkout URL and update invoice
      const generateCheckoutUrlPromise = new RetryOperationService(
        async () => {
          // Get agency organization data for domain
          const { data: organizationData, error: orgError } = await this.adminClient
            .from('organizations')
            .select('id, organization_subdomains(subdomains(domain)), owner_id')
            .eq('id', agencyOrganizationId)
            .single();

          if (orgError) {
            console.error('Error fetching organization:', orgError);
            throw new Error(`Failed to fetch organization: ${orgError.message}`);
          }

          const domain = organizationData?.organization_subdomains?.[0]?.subdomains?.domain ?? '';

          const isProd = process.env.NEXT_PUBLIC_IS_PROD === 'true';
          const baseUrl = (domain.includes('localhost') ?? !isProd)
            ? `http://${domain}`
            : `https://${domain}`;

          const checkoutUrl = await createUrlForCheckout({
            stripeId: '',
            priceId: '',
            invoice: createdInvoice,
            organizationId: agencyOrganizationId,
            baseUrl: baseUrl,
            primaryOwnerId: organizationData.owner_id ?? '',
          });

          // Update the invoice with the generated checkout URL
          await this.adminClient
            .from('invoices')
            .update({ checkout_url: checkoutUrl })
            .eq('id', createdInvoice.id);

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

      // Create activity for invoice creation
      await this.activityService.createActivity({
        action: 'create',
        actor: 'System',
        message: 'has created',
        type: Activity.Enums.ActivityType.INVOICE,
        clientId: userClientId,
        invoiceId: createdInvoice.id,
        value: createdInvoice.number,
      });

      console.log('Activity created for invoice generation');

      return {
        invoiceId: createdInvoice.id,
        invoiceNumber: createdInvoice.number,
        totalAmount,
      };

    } catch (error) {
      console.error('Error generating manual payment invoice:', error);
      throw error;
    }
  }

  /**
   * @name buildInvoiceNotes
   * @description Builds comprehensive notes for the invoice
   */
  private buildInvoiceNotes({
    serviceName,
    isRecurring,
    clientName,
    clientEmail,
    manualPaymentInfo,
    discountCoupon,
  }: {
    serviceName: string;
    isRecurring: boolean;
    clientName?: string;
    clientEmail?: string;
    manualPaymentInfo?: string;
    discountCoupon?: string;
  }): string {
    let notes = `Manual payment for ${isRecurring ? 'recurring' : 'one-time'} service: ${serviceName}`;
    
    if (clientName && clientEmail) {
      notes += `\nCustomer: ${clientName} (${clientEmail})`;
    }
    
    if (discountCoupon) {
      notes += `\nDiscount coupon applied: ${discountCoupon}`;
    }
    
    if (manualPaymentInfo) {
      notes += `\nPayment details: ${manualPaymentInfo}`;
    }
    
    return notes;
  }

  /**
   * @name buildItemDescription
   * @description Builds description for invoice items
   */
  private buildItemDescription(serviceName: string, isRecurring: boolean): string {
    return `${serviceName} (${isRecurring ? 'Recurring subscription' : 'One-time payment'})`;
  }

  /**
   * @name buildPaymentNotes
   * @description Builds notes for payment records
   */
  private buildPaymentNotes({
    serviceName,
    manualPaymentInfo,
    discountCoupon,
  }: {
    serviceName: string;
    manualPaymentInfo?: string;
    discountCoupon?: string;
  }): string {
    let notes = `Manual payment for service: ${serviceName}`;
    
    if (discountCoupon) {
      notes += ` (Coupon: ${discountCoupon})`;
    }
    
    if (manualPaymentInfo) {
      notes += ` - ${manualPaymentInfo}`;
    }
    
    return notes;
  }

  /**
   * @name handleSubscriptionDeletedWebhook
   * @description Handles the webhook for when a subscription is deleted.
   * @param subscription
   */
  async handleSubscriptionDeletedWebhook(subscription: Subscription.Type) {
    const gateway = createBillingGatewayService(
      subscription.billing_provider,
      this.baseUrl,
    );

    const subscriptionData = await gateway.getSubscription(subscription.id);
    const isCanceled = subscriptionData.status === 'canceled';

    if (isCanceled) {
      return;
    }

    return gateway.cancelSubscription({
      subscriptionId: subscription.id,
    });
  }

  async handleBillingAccountCreatedWebhook(account: BillingAccounts.Type) {
 
    const { data: servicesResult, error: servicesError } =
      await this.adminClient
        .from('services')
        .select('*, billing_services(provider)')
        .eq('propietary_organization_id', account.account_id ?? '');

    if (servicesError) throw new Error(servicesError.message);

    const gateway = createBillingGatewayService(account.provider, this.baseUrl);
    const promises: Promise<unknown>[] = [];
    servicesResult.forEach((service) => {
      const hasBillingService = Array.isArray(service.billing_services)
        ? service.billing_services.find(
            (billingService) => billingService.provider === account.provider,
          )
        : (service.billing_services as unknown as { provider: string })
            .provider;
      if (!hasBillingService) {
        promises.push(gateway.createService(service, account));
      }
    });
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  async handleServiceCreatedWebhook(service: Service.Type) {
    // verify if account has treli enabled
    const [accountsResult, servicesResult] = await Promise.all([
      this.adminClient
        .from('billing_accounts')
        .select('*')
        .eq('account_id', service.propietary_organization_id ?? '')
        .is('deleted_on', null),

      this.adminClient
        .from('billing_services')
        .select('service_id, provider')
        .eq('service_id', service.id),
    ]);
    if (accountsResult.error) throw new Error(accountsResult.error.message);
    if (servicesResult.error) throw new Error(servicesResult.error.message);
    // Create a Set of existing service providers for faster lookup
    const existingProviders = new Set(
      servicesResult.data.map((service) => service.provider),
    );
    // Only create services for providers that don't already have one
    const promises = accountsResult.data
      .filter((account) => !existingProviders.has(account.provider))
      .map((account) => {
        const gateway = createBillingGatewayService(
          account.provider,
          this.baseUrl,
        );
        return gateway.createService(service, account);
      });
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return true;
  }

  async handleServiceUpdatedWebhook(service: Service.Type, oldService?: Service.Type) {
    // stop bucle if oldService is not provided
    if (!oldService?.price_id && service.price_id) return true;
    const priceChanged = oldService?.price !== service.price;

    // verify if account has treli enabled

    const [accountsResult] = await Promise.all([
      this.adminClient
        .from('billing_accounts')
        .select('*')
        .eq('account_id', service.propietary_organization_id ?? '')
        .is('deleted_on', null),
    ]);
    if (accountsResult.error) throw new Error(accountsResult.error.message);
    const promises = accountsResult.data.map(async (account) => {
      const gateway = createBillingGatewayService(
        account.provider,
        this.baseUrl,
      );
      const { error: billingServicesError, data: billingServicesData } =
        await this.adminClient
          .from('billing_services')
          .select('provider_id')
          .eq('service_id', service.id)
          .single();
      if (billingServicesError) throw new Error(billingServicesError.message);
      return gateway.updateService(
        service,
        account,
        billingServicesData?.provider_id,
        priceChanged,
      );
    });
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return true;
  }
}