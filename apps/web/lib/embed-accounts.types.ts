import { Database } from "./database.types";

export namespace EmbedAccounts {
  export type Type = Database["public"]["Tables"]["embed_accounts"]["Row"];
  export type Insert = Database["public"]["Tables"]["embed_accounts"]["Insert"];
  export type Update = Database["public"]["Tables"]["embed_accounts"]["Update"];
}
