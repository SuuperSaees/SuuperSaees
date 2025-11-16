import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@kit/supabase/database';
import { BaseWebhookService } from '../shared/base-webhook.service';
import { createClient } from '../../../../../features/team-accounts/src/server/actions/clients/create/create-clients';
import { insertServiceToClient } from '../../../../../features/team-accounts/src/server/actions/services/create/create-service';

export class TreliWebhookService extends BaseWebhookService {
  constructor(adminClient: SupabaseClient<Database>) {
    super(adminClient);
  }

  private readonly ClientRoleTreliInvitation = 'client_owner';

  async handleTreliWebhook(body: {
    event_type: string;
    content: {
      items: { id: string }[];
      billing: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  }, treliSignature: string) {
    console.log('handleTreliWebhook', treliSignature);
        try {
          if (body.event_type === 'subscription_created') {
            const { data: billingServiceData, error: billingServiceError } =
              await this.adminClient
                .from('billing_services')
                .select('service_id')
                .eq('provider_id', body?.content?.items[0]?.id ?? '')
                .single();
    
            if (billingServiceError) {
              console.error('Error fetching billing service:', billingServiceError);
              throw billingServiceError;
            }
    
            const { data: serviceData, error: serviceError } =
              await this.adminClient
                .from('services')
                .select('propietary_organization_id')
                .eq('id', billingServiceData?.service_id)
                .single();
    
            if (serviceError) {
              console.error('Error fetching service:', serviceError);
              throw serviceError;
            }
    
            const {
              data: accountDataAgencyOwnerData,
              error: accountDataAgencyOwnerError,
            } = await this.adminClient
              .from('organizations')
              .select('id')
              .eq('owner_id', serviceData?.propietary_organization_id ?? '')
              .single();
    
            if (accountDataAgencyOwnerError) {
              console.error(
                'Error fetching organization:',
                accountDataAgencyOwnerError,
              );
              throw accountDataAgencyOwnerError;
            }
            const organizationId = accountDataAgencyOwnerData?.id;
            if (organizationId) {
              // Search organization by accountId
              const fullName = `${body?.content?.billing?.first_name} ${body?.content?.billing?.last_name}`;
              const newClient = {
                email: body?.content?.billing?.email,
                slug: `${fullName}'s Organization`,
                name: fullName,
              };
              const createdBy = accountDataAgencyOwnerData?.id;
    
              // Check if the client already exists
              const { data: clientData, error: clientError } =
                await this.adminClient
                  .from('accounts')
                  .select('id')
                  .eq('email', newClient.email)
                  .eq('is_personal_account', true)
                  .single();
    
              if (clientError) {
                console.error('Error fetching user account:', clientError);
              }
              let client;
              if (!clientData) {
                client = await createClient({
                  client: newClient,
                  role: this.ClientRoleTreliInvitation,
                  agencyId: organizationId ?? '',
                  adminActivated: true,
                });
              }
    
              // After assign a service to the client, we need to create the subscription
              // Search in the database, by checkout session id
    
              let clientOrganizationId = '';
              let clientId;

              if (clientData) {
                const { data: clientDataWithChecker, error: clientError } =
                  await this.adminClient
                    .from('clients')
                    .select('id, organization_client_id')
                    .eq('user_client_id', clientData.id)
                    .eq('agency_id', organizationId ?? '')
                    .single();
    
                if (clientError) {
                  console.error('Error fetching client:', clientError);
                }
                
                if (clientDataWithChecker) {
                  clientId = clientDataWithChecker.id;
                  clientOrganizationId = clientDataWithChecker.organization_client_id;
                } else {
                  const { data: createClientDataWithChecker, error: clientError } =
                    await this.adminClient
                      .from('clients')
                      .insert({
                        agency_id: organizationId ?? '',
                        organization_client_id: clientOrganizationId ?? '',
                        user_client_id: clientData.id,
                      })
                      .select('id')
                      .single();
    
                  if (clientError) {
                    console.error('Error creating client:', clientError);
                  }
    
                  clientId = createClientDataWithChecker?.id;
                }
              } else {
                clientId = client?.success?.data?.id;
                clientOrganizationId = client?.success?.data?.organization_client_id  ?? '';
              }
              await insertServiceToClient(
                this.adminClient,
                clientOrganizationId ?? '',
                billingServiceData?.service_id ?? 0,
                clientId ?? '',
                createdBy ?? '',
                organizationId ?? '',
              );
            }
          }
        } catch (error) {
          console.error('Error handling treli webhook:', error);
          return;
        }
  }
}