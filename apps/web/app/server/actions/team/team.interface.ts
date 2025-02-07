import { Account } from "~/lib/account.types";
export interface GetTeamsOptions {
  organizationIds: Account.Type['id'][]; 
  includeMembers?: boolean;
  includeAgency?: boolean;

  // Not used yet
  getAllOrganizations?: boolean;
}