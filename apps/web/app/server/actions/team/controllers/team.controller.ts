import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { TeamRepository } from '../repositories/team.repository';
import { TeamService } from '../services/team.service';
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from '../team.interface';

export class TeamController 
 {
    private baseUrl: string
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

  async list({ organizationIds, includeMembers, includeAgency }: GetTeamsOptions): Promise<Members.TeamResponse> {
    try {
        const teamRepository = new TeamRepository(this.client, this.adminClient);

        const teamService = new TeamService(teamRepository);

      return await teamService.list({ organizationIds, includeMembers, includeAgency });

    } catch (error) {
      console.error(error);
      throw error;
    }


  }
}