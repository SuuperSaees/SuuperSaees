import { Database } from "./database.types";

export namespace Embeds {
  export type EmbedLocation = Database["public"]["Enums"]["embed_location"];
  export type EmbedTypes = Database["public"]["Enums"]["embed_types"];

  export type Type = Database["public"]["Tables"]["embeds"]["Row"];
  export type Insert = Database["public"]["Tables"]["embeds"]["Insert"];
  export type Update = Database["public"]["Tables"]["embeds"]["Update"];

  export type TypeWithRelations = Type & {
    organizations?: {
      id: string;
      name: string;
      picture_url: string;
    }[];
  };
}
