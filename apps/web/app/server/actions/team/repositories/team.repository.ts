import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from '../team.interface';
export class TeamRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly adminClient?: SupabaseClient<Database>,

  ) {}

  async list({ organizationIds, includeMembers, includeAgency }: GetTeamsOptions): Promise<Members.TeamResponse> {
    const client = this.adminClient ?? this.client;
    if (!organizationIds.length && !includeAgency) {
      return {}
    }

    const resultMembers: Members.TeamResponse = {}

    // get the agency if organizationIds is empty and includeAgency is true
    if (includeAgency && !organizationIds.length) {
      // If the user is not logged in, return an empty object
      const user = (await this.client.auth.getUser()).data;

      if (!user) {
        return resultMembers;
      }

      const { data: getAccountInfo, error: getAccountInfoError } = await this.client
      .from('accounts_memberships')
      .select('organization_id, account_role')
      .eq('user_id', user?.user?.id ?? '')
      .or('account_role.eq.client_owner,account_role.eq.client_member,account_role.eq.client_guest')
      .single();
      
      if (getAccountInfoError) {
        return resultMembers;
      }

      const { data: getClientInfo, error: getClientInfoError } = await this.client
      .from('clients')
      .select('agency_id')
      .eq('organization_client_id', getAccountInfo.organization_id ?? '')
      .eq('user_client_id', user?.user?.id ?? '')
      .single();
      
      if (getClientInfoError) {
        return resultMembers;
      }
      
      const { data: getAgencyInfo, error: getAgencyInfoError } = await this.client
      .from('organizations')
      .select('id, name, organization_settings(value), slug, statuses:agency_statuses(*), tags(*)')
      .eq('id', getClientInfo.agency_id)
      .eq('organization_settings.key', 'logo_url')
      .single();

      if (getAgencyInfoError) {
        return resultMembers;
      }

      resultMembers[getClientInfo.agency_id]  = {
        id: getAgencyInfo.id,
        name: getAgencyInfo.name ?? '',
        picture_url: getAgencyInfo.organization_settings?.[0]?.value ?? '',
        is_agency: true,
        slug: getAgencyInfo.slug ?? '',
        statuses: getAgencyInfo.statuses ?? [],
        tags: getAgencyInfo.tags ?? [],
      }
    }

    // get the organizations if organizationIds is not empty and includeAgency is false
    const agencyRoles = new Set(['agency_owner', 'agency_member', 'agency_project_manager']);

    for (const organizationId of organizationIds) {
      const { data: organizationSettings } = await client
      .from('organization_settings')
      .select('value')
      .eq('key', 'logo_url')
      .eq('organization_id', organizationId)
      .single();

      const { data: organization, error: organizationError } = await client
      .from('organizations')
      .select('id, name, picture_url, accounts_memberships(account_role), slug, statuses:agency_statuses(*), tags(*)')
      .eq('id', organizationId)
      .single();

      if (organizationError) throw organizationError;

      resultMembers[organizationId] = {
        id: organization.id,
        name: organization.name ?? '',
        picture_url: organizationSettings?.value ?? organization.picture_url ?? '',
        is_agency: agencyRoles.has(organization.accounts_memberships[0]?.account_role ?? ''),
        slug: organization.slug ?? '',
        statuses: organization.statuses ?? [],
        tags: organization.tags ?? [],
      }

      if (includeMembers) {
        const { data: members, error: membersError } = await client
        .from('accounts_memberships')
        .select('user_id, account_role')
        .eq('organization_id', organizationId);

        if (membersError) throw membersError;

        const membersIds = members.map((member) => member.user_id);

        const { data: membersData, error: membersDataError } = await client
        .from('accounts')
        .select('id, email, name, picture_url, user_settings(name, picture_url)')
        .in('id', membersIds)
        .is('deleted_on', null);

        if (membersDataError) throw membersDataError;

        const membersDataMap = new Map(membersData.map((member) => [member.id, member]));
        resultMembers[organizationId].members = members
          .filter((member) => membersDataMap.has(member.user_id))
          .map((member) => ({
            id: member.user_id,
            name: membersDataMap.get(member.user_id)?.user_settings?.[0]?.name ?? membersDataMap.get(member.user_id)?.name ??  '',
            email: membersDataMap.get(member.user_id)?.email ?? '',
            organization_id: organizationId,
            role: member.account_role,
            picture_url: membersDataMap.get(member.user_id)?.user_settings?.[0]?.picture_url ?? membersDataMap.get(member.user_id)?.picture_url ??  '',
            // visibility: true,
          }));

      }
      

    }
    return resultMembers;
  }
}