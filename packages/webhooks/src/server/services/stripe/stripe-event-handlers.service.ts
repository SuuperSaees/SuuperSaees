import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { BaseWebhookService } from '../shared/base-webhook.service';
import { StripeSubscriptionService } from './stripe-subscription.service';
import { StripeInvoiceService } from './stripe-invoice.service';
import { StripePaymentService } from './stripe-payment.service';

export class StripeEventHandlersService extends BaseWebhookService {
  private readonly subscriptionService: StripeSubscriptionService;
  private readonly invoiceService: StripeInvoiceService;
  private readonly paymentService: StripePaymentService;

  constructor(adminClient: SupabaseClient<Database>) {
    super(adminClient);
    this.subscriptionService = new StripeSubscriptionService(adminClient);
    this.invoiceService = new StripeInvoiceService(adminClient);
    this.paymentService = new StripePaymentService(adminClient);
  }

  async handlePaymentIntentSucceeded(data: any) {
    try {
      console.log('Processing payment intent succeeded:', data.id);

      // Buscar el cliente por el customer ID
      const { data: clientSubscription, error: clientError } = await this.adminClient
        .from('client_subscriptions')
        .select('clients(organization_client_id, user_client_id)')
        .eq('billing_customer_id', data.customer)
        .eq('billing_provider', 'stripe')
        .single();

      if (clientError) {
        console.log('No client subscription found, this might be a one-time payment');
        
        // Try to find the agency from the connected account
        const { data: billingAccount, error: billingError } = await this.adminClient
          .from('billing_accounts')
          .select('account_id, accounts(id, organizations(id))')
          .eq('provider_id', data.transfer_data?.destination || 'default')
          .single();

        if (billingError || !billingAccount) {
          console.error('Error finding billing account for one-time payment:', billingError);
          return;
        }

        const agencyId = Array.isArray(billingAccount.accounts?.organizations) 
          ? billingAccount.accounts.organizations[0]?.id 
          : billingAccount.accounts?.organizations?.id;

        // For one-time payments, we need to create a temporary client organization
        // This is a simplified approach - you might want to handle this differently
        const tempClientOrganizationId = 'temp-client-org-id';
        const tempUserClientId = 'temp-user-client-id';

        await this.paymentService.handleOneTimePayment(
          data, 
          agencyId, 
          tempClientOrganizationId, 
          tempUserClientId,
          { id: 1, name: 'One-time Service' }
        );
        return;
      }

      const clientOrganizationId = Array.isArray(clientSubscription.clients?.organization_client_id)
        ? clientSubscription.clients.organization_client_id[0]
        : clientSubscription.clients?.organization_client_id;
      const userClientId = clientSubscription.clients?.user_client_id ?? '';

      // For regular subscription payments, we don't need to create a separate invoice
      // as it will be handled by the invoice webhook events
      console.log('Payment intent succeeded for subscription customer');

    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
    }
  }

  // Expose service methods
  async handleSubscriptionCreated(event: any, stripeAccountId?: string) {
    return this.subscriptionService.handleSubscriptionCreated(event, stripeAccountId);
  }

  async handleSubscriptionUpdated(data: any) {
    return this.subscriptionService.handleSubscriptionUpdated(data);
  }

  async handleSubscriptionDeleted(subscriptionId: string) {
    return this.subscriptionService.handleSubscriptionDeleted(subscriptionId);
  }

  async handleInvoiceCreated(event: any, stripeAccountId?: string) {
    return this.invoiceService.handleInvoiceCreated(event, stripeAccountId);
  }

  async handleInvoiceUpdated(event: any) {
    return this.invoiceService.handleInvoiceUpdated(event);
  }

  async handleInvoicePayment(data: any) {
    return this.invoiceService.handleInvoicePayment(data);
  }

  async handleOneTimePayment(data: any, agencyId: string, clientOrganizationId: string, userClientId: string, service?: { id?: number, name?: string }) {
    return this.paymentService.handleOneTimePayment(data, agencyId, clientOrganizationId, userClientId, service);
  }
}