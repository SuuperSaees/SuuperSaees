'use server';

import { createTeamAction } from './team';
import { GetTeamsOptions } from './team.interface';

function getTeamAction() {
  return createTeamAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}
export async function getTeams({ organizationIds, includeMembers, includeAgency }: GetTeamsOptions) {
  return await getTeamAction().getTeams({ organizationIds, includeMembers, includeAgency });
}