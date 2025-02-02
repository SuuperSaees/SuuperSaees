import { TeamRepository } from "../repositories/team.repository";
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from "../team.interface";

export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
  ) {}

  async getTeams({ organizationId, role }: GetTeamsOptions): Promise<Members.Type> {
    return await this.teamRepository.getTeams({ organizationId, role });
  }

}