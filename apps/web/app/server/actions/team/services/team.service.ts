import { TeamRepository } from "../repositories/team.repository";
import { Members } from '~/lib/members.types';
import { GetTeamsOptions } from "../team.interface";

export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
  ) {}

  async list({ organizationIds, includeMembers, includeAgency }: GetTeamsOptions): Promise<Members.TeamResponse> {
    return await this.teamRepository.list({ organizationIds, includeMembers, includeAgency });
  }

}