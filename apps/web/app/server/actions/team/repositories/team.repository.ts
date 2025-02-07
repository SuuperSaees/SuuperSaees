import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from '../team.interface';

export class TeamRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly adminClient?: SupabaseClient<Database>,

  ) {}

  async getTeams({ organizationIds, includeMembers }: GetTeamsOptions): Promise<Members.TeamResponse> {
    // YOUR TABLE HERE
    const client = this.adminClient ?? this.client;
    const agencyRoles = new Set(['agency_owner', 'agency_member', 'agency_project_manager']);
    // const clientRoles = new Set(['client_admin', 'client_member', 'client_guest']);
    const resultMembers: Members.TeamResponse = {}


    for (const organizationId of organizationIds) {
      const { data: organizationSettings } = await client
      .from('organization_settings')
      .select('value')
      .eq('key', 'logo_url')
      .eq('account_id', organizationId)
      .single();

      const { data: organization, error: organizationError } = await client
      .from('accounts')
      .select('id, name, accounts_memberships(account_role)')
      .eq('id', organizationId)
      .eq('is_personal_account', false)
      .single();

      if (organizationError) throw organizationError;

      resultMembers[organizationId] = {
        id: organization.id,
        name: organization.name,
        picture_url: organizationSettings?.value ?? '',
        is_agency: agencyRoles.has(organization.accounts_memberships[0]?.account_role ?? ''),
      }

      if (includeMembers) {
        const { data: members, error: membersError } = await client
        .from('accounts_memberships')
        .select('user_id, account_role')
        .eq('account_id', organizationId);

        if (membersError) throw membersError;

        const membersIds = members.map((member) => member.user_id);

        const { data: membersData, error: membersDataError } = await client
        .from('accounts')
        .select('id, email, user_settings(name, picture_url)')
        .in('id', membersIds);

        if (membersDataError) throw membersDataError;

        const membersDataMap = new Map(membersData.map((member) => [member.id, member]));
        
        resultMembers[organizationId].members = members.map((member) => ({
          id: member.user_id,
          name: membersDataMap.get(member.user_id)?.user_settings?.name ?? '',
          email: membersDataMap.get(member.user_id)?.email ?? '',
          organization_id: organizationId,
          picture_url: membersDataMap.get(member.user_id)?.user_settings?.picture_url ?? '',
        }
      ));
      }
      
    }

    return resultMembers;

  }


}