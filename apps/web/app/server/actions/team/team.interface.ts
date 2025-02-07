import { Account } from "~/lib/account.types";
export interface GetTeamsOptions {
  organizationIds: Account.Type['id'][]; 
  includeMembers?: boolean;

  // Not used yet
  includeAgency?: boolean;
  getAllOrganizations?: boolean;
}