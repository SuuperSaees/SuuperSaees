import { Embeds } from "~/lib/embeds.types";

export interface ISecurityAction {
    sanitizeText(text: string): Promise<string>;
    validateEmbedData(data: Embeds.Insert | Embeds.Update): Promise<void>;
    validateIframe(value: string): Promise<void>;
    validateUrl(value: string): Promise<void>;
    validateXssAttack(value: string): Promise<void>;
}
