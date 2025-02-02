import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from '../team.interface';

export class TeamRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly adminClient?: SupabaseClient<Database>,

  ) {}

  async getTeams({ organizationId, role }: GetTeamsOptions): Promise<Members.Type> {
    // YOUR TABLE HERE
    const agencyRoles = new Set(['agency_owner', 'agency_member', 'agency_project_manager']);
    const clientRoles = new Set(['client_admin', 'client_member', 'client_guest']);

    const isAgency = agencyRoles.has(role ?? '');
    const isClient = clientRoles.has(role ?? '');

    if (!isAgency && !isClient) {
      throw new Error('Invalid role');
    }

    const resultMembers: Members.Type = {
      organizations: [],
      members: [],
    }

    const { data: agencyOrganization, error: agencyOrganizationError } = await this.client
    .from('accounts')
    .select('id, name, logo_url:organizations_settings(logo_url)')
    .eq('id', organizationId)
    .single();

    if (agencyOrganizationError) throw agencyOrganizationError;
    
    resultMembers.organizations.push({
      id: agencyOrganization.id,
      name: agencyOrganization.name,
      logo_url: agencyOrganization.logo_url[0] ?? '',
    });

    if (isAgency) {
      
      const { data: clientOrganizations, error: clientOrganizationsError } = await this.client
      .from('clients')
      .select('organization_client_id')
      .eq('organization_client_id', organizationId);

      if (clientOrganizationsError) throw clientOrganizationsError;

      const clientOrganizationIds = clientOrganizations.map((client) => client.organization_client_id);

      const { data: clientOrganizationsData, error: clientOrganizationsDataError } = await this.client
      .from('accounts')
      .select('id, name, logo_url:organizations_settings(logo_url)')
      .in('id', clientOrganizationIds);

      if (clientOrganizationsDataError) throw clientOrganizationsDataError;

      resultMembers.organizations.push(...clientOrganizationsData.map((client) => ({
        id: client.id,
        name: client.name,
        logo_url: client.logo_url[0] ?? '',
      })));

      const { data: agencyMembersIds, error: agencyMembersIdsError } = await this.client
      .from('accounts_memberships')
      .select('user_id')
      .eq('account_id', organizationId);


      if (agencyMembersIdsError) throw agencyMembersIdsError;


      const { data: agencyMembers, error: agencyMembersError } = await this.client
      .from('user_settings')
      .select('user_id, name, picture_url, email:accounts(email)')
      .in('user_id', agencyMembersIds.map((member) => member.user_id));


      if (agencyMembersError) throw agencyMembersError;


      resultMembers.members.push(...agencyMembers.map((member) => ({
        id: member.user_id ?? '',
        name: member.name ?? '',
        email: typeof member.email === 'string' ? member.email : member.email?.email ?? '',
        picture_url: member.picture_url ?? '',
      })));


      for (const clientOrganizationId of clientOrganizationIds) {
        const { data: clientOrganizationIds, error: clientOrganizationIdsError } = await this.client
        .from('accounts_memberships')
        .select('user_id')
        .eq('account_id', clientOrganizationId);

        if (clientOrganizationIdsError) throw clientOrganizationIdsError;

        const clientMemberIds = clientOrganizationIds.map((member) => member.user_id);


        const { data: clientMembers, error: clientMembersError } = await this.client
        .from('user_settings')
        .select('user_id, name, picture_url, email:accounts(email)')
        .in('user_id', clientMemberIds);
      if (clientMembersError) throw clientMembersError;

      resultMembers.members.push(...clientMembers.map((member) => ({
        id: member.user_id ?? '',
        name: member.name ?? '',
        email: typeof member.email === 'string' ? member.email : member.email?.email ?? '',
        picture_url: member.picture_url ?? '',
      })));
    }
  }


    if (isClient) {
      const { data: clientMembersIds, error: clientMembersIdsError } = await this.client
      .from('accounts_memberships')
      .select('user_id')
      .eq('account_id', organizationId);

      if (clientMembersIdsError) throw clientMembersIdsError;

      const clientMemberIds = clientMembersIds.map((member) => member.user_id);

      const { data: clientMembers, error: clientMembersError } = await this.client
      .from('user_settings')
      .select('user_id, name, picture_url, email:accounts(email)')
      .in('user_id', clientMemberIds);

      if (clientMembersError) throw clientMembersError;
      

      resultMembers.members.push(...clientMembers.map((member) => ({
        id: member.user_id ?? '',
        name: member.name ?? '',
        email: typeof member.email === 'string' ? member.email : member.email?.email ?? '',
        picture_url: member.picture_url ?? '',
      })));

      const { data: agencyOrganization, error: agencyOrganizationError } = await this.client
      .from('clients')
      .select('agency_id')
      .eq('organization_client_id', organizationId)
      .single();


      if (agencyOrganizationError) throw agencyOrganizationError;

      const agencyOrganizationId = agencyOrganization.agency_id;

      const { data: agencyMembersIds, error: agencyMembersIdsError } = await this.client
      .from('accounts_memberships')
      .select('user_id')
      .eq('account_id', agencyOrganizationId);

      if (agencyMembersIdsError) throw agencyMembersIdsError;

      const agencyMemberIds = agencyMembersIds.map((member) => member.user_id);

      const { data: agencyMembers, error: agencyMembersError } = await this.client
      .from('user_settings')
      .select('user_id, name, picture_url, email:accounts(email)')
      .in('user_id', agencyMemberIds);

      if (agencyMembersError) throw agencyMembersError;

      resultMembers.members.push(...agencyMembers.map((member) => ({
        id: member.user_id ?? '',
        name: member.name ?? '',
        email: typeof member.email === 'string' ? member.email : member.email?.email ?? '',
        picture_url: member.picture_url ?? '',
      })));
      
    }

    return resultMembers;
  }

}