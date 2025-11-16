import { BaseAction } from '../base-action';
import { SecurityController } from './controllers/security.controller';
import { ISecurityAction } from './security.interface';
import { Embeds } from '~/lib/embeds.types';
export class SecurityAction extends BaseAction implements ISecurityAction {
    private controller: SecurityController;
    
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new SecurityController(this.baseUrl);
    }
    
    async sanitizeText(text: string): Promise<string> {
        return this.controller.sanitizeText(text);
    }

    async validateEmbedData(data: Embeds.Insert | Embeds.Update): Promise<void> {
        return this.controller.validateEmbedData(data);
    }

    async validateIframe(value: string): Promise<void> {
        return this.controller.validateIframe(value);
    }

    async validateUrl(value: string): Promise<void> {
        return this.controller.validateUrl(value);
    }

    async validateXssAttack(value: string): Promise<void> {
        return this.controller.validateXssAttack(value);
    }
}

export function createSecurityAction(baseUrl: string) {
    return new SecurityAction(baseUrl);
}
