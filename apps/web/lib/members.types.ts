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
    picture_url: string;
  }
}


