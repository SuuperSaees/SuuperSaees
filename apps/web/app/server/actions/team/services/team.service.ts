import { TeamRepository } from "../repositories/team.repository";
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from "../team.interface";

export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
  ) {}

  async getTeams({ organizationIds, includeMembers }: GetTeamsOptions): Promise<Members.TeamResponse> {
    return await this.teamRepository.getTeams({ organizationIds, includeMembers });
  }

}