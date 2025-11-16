import { SecurityService } from '../services/security.service';
import { Embeds } from '~/lib/embeds.types';

export class SecurityController {
    private securityService: SecurityService;

    constructor(
        private baseUrl: string,
    ) {
        this.securityService = new SecurityService();
    }

    async sanitizeText(text: string): Promise<string> {
        await Promise.resolve();
        return this.securityService.sanitizeText(text);
    }

    async validateEmbedData(data: Embeds.Insert | Embeds.Update): Promise<void> {
        return await this.securityService.validateEmbedData(data);
    }

    async validateIframe(value: string): Promise<void> {
        return await this.securityService.validateIframe(value);
    }

    async validateUrl(value: string): Promise<void> {
        return await this.securityService.validateUrl(value);
    }

    async validateXssAttack(value: string): Promise<void> {
        await Promise.resolve();
        return this.securityService.validateXssAttack(value);
    }
}