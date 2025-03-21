import { Members } from '~/lib/members.types';
import { BaseAction } from '../base-action';
import { TeamController } from './controllers/team.controller';
import { GetTeamsOptions } from './team.interface';

export class TeamAction extends BaseAction {
  private controller: TeamController;

  constructor(baseUrl: string) {
    super(baseUrl);
    this.controller = new TeamController(
      this.baseUrl,
      this.client,
      this.adminClient,
    );
  }

  async getTeams({ organizationIds, includeMembers, includeAgency }: GetTeamsOptions): Promise<Members.TeamResponse> {
    return await this.controller.list({ organizationIds, includeMembers, includeAgency });
  }


}

export function createTeamAction(baseUrl: string) {
  return new TeamAction(baseUrl);
}
