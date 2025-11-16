import { AgencyStatus } from "./agency-statuses.types";
import { Tags } from "./tags.types";

export namespace Members {
  export type Type = {
    organizations: Organization[];
    members: Member[];

  }

  export type Organization = {
    id: string;
    name: string;
    logo_url?: string;
    picture_url?: string;
    members?: Member[];
    is_agency?: boolean;
  }

  export type Member = {
    id: string;
    name: string;
    email: string;
    organization_id: string;
    picture_url: string;
    role: string;
    visibility: boolean;
  }



  export type TeamResponse = Record<string, {
    id: string;
    name: string;
    picture_url: string;
    members?: Member[];
    is_agency?: boolean;
    slug: string;
    statuses?: AgencyStatus.Type[];
    tags?: Tags.Type[];
  }>


}


