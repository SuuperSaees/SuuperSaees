export namespace Members {
  export type Type = {
    organizations: Organization[];
    members: Member[];

  }

  export type Organization = {
    id: string;
    name: string;
    logo_url: string;
  }

  export type Member = {
    id: string;
    name: string;
    email: string;
    organization_id: string;
    picture_url: string;
  }

  export type TeamResponse = Record<string, {
    id: string;
    name: string;
    picture_url: string;
    members?: Member[];
    is_agency?: boolean;
  }>


}


