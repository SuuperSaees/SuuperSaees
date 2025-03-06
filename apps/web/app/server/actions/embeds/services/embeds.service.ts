import { IEmbedsService } from "./embeds.service.interface";
import { EmbedsRepository } from "../repositories/embeds.repository";
import { Embeds } from "~/lib/embeds.types";
import { EmbedAccountsRepository } from "../../embed-accounts/repositories/embed-accounts.repository";
import { CustomError } from "@kit/shared/response";
import { HttpStatus } from "@kit/shared/response";

export class EmbedsService implements IEmbedsService {
    constructor(private readonly embedsRepository: EmbedsRepository, private readonly embedAccountsRepository?: EmbedAccountsRepository) {
        this.embedsRepository = embedsRepository;
        this.embedAccountsRepository = embedAccountsRepository;
    }

    async create(payload: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type> {
        // Validar los datos antes de crear
        this.validateEmbedData(payload);
        
        const embedCreated = await this.embedsRepository.create(payload);

        const embedAccounts = accountIds?.map((accountId) => ({
            embed_id: embedCreated.id,
            account_id: accountId,
        }));

        if (embedAccounts && embedCreated.visibility === 'private') {
            await this.embedAccountsRepository?.create(embedAccounts);
        }

        return embedCreated;
    }

    async update(embedId: string, payload: Embeds.Update): Promise<Embeds.Type> {
        // Validar los datos antes de actualizar
        this.validateEmbedData(payload);
        
        const embedUpdated = await this.embedsRepository.update(embedId, payload);

        return embedUpdated;
    }

    async delete(embedId: string): Promise<void> {
        return await this.embedsRepository.delete(embedId);
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        const embed = await this.embedsRepository.get(embedId);

        return embed;
    }
    async list(organizationId?: string, role?: string, agencyId?: string): Promise<Embeds.TypeWithRelations[]> {
        return await this.embedsRepository.list(organizationId, role, agencyId);
    }

    /**
     * Validate the embed data
     * @param data Data of the embed to validate
     * @throws CustomError if the data is not valid
     */
    private validateEmbedData(data: Embeds.Insert | Embeds.Update): void {
        // Validate the title if it exists
        if (data.title) {
            if (data.title.length > 255) {
                throw new CustomError(HttpStatus.Error.BadRequest, "The title cannot exceed 255 characters");
            }
            
            // Sanitize the title to prevent XSS
            data.title = this.sanitizeText(data.title);
        }
        
        // Validate the value according to the type
        if (data.value && data.type) {
            if (data.type === 'iframe') {
                this.validateIframe(data.value);
            } else if (data.type === 'url') {
                this.validateUrl(data.value);
            }
        }
    }
    
    /**
     * Validate that the value is a valid and secure iframe
     */
    private validateIframe(value: string): void { // aceptar cualquier tipo de embebidos. Modiofcar este validateIframe para aceptar cualquier tipo de embebidos. 
        // Validate the basic iframe format
        const iframeRegex = /^<iframe\s+.*<\/iframe>$/;
        if (!iframeRegex.test(value)) {
            throw new CustomError(HttpStatus.Error.BadRequest, "The value must be a valid iframe HTML");
        }
        // Extract the src attribute PRE FETCH Con los headers. 
        const srcMatch = value.match(/src=["'](.*?)["']/);
        if (!srcMatch) {
            throw new CustomError(HttpStatus.Error.BadRequest, "The iframe must contain a valid src attribute");
        }
        
        const src = srcMatch[1];
        
        // Validate that the src is a secure URL
        if (src) {
            this.validateUrl(src);
        } else {
            throw new CustomError(HttpStatus.Error.BadRequest, "The iframe must contain a valid src attribute");
        }
        
        // Validate that it does not contain scripts or events on*
        if (/(<script|javascript:|on\w+=)/i.test(value)) {
            throw new CustomError(HttpStatus.Error.BadRequest, "The iframe contains potentially dangerous code");
        }
        
        // Sanitize the iframe
        // In a real implementation, we would use a library like DOMPurify
    }
    
    /**
     * Validate that the value is a valid and secure URL
     */
    private validateUrl(value: string): void {
        try {
            const url = new URL(value);
            
            // Validate the secure protocol
            if (url.protocol !== 'https:') {
                throw new CustomError(HttpStatus.Error.BadRequest, "Only HTTPS URLs are allowed");
            }
            
            // // White list of domains (example) PRE FETCH Con los headers. 
            // const allowedDomains = [
            //     'youtube.com', 'www.youtube.com',
            //     'vimeo.com', 'player.vimeo.com',
            //     // Add more allowed domains
            // ];
            
            // // Validate the domain
            // const domain = url.hostname;
            // if (!allowedDomains.some(d => domain === d || domain.endsWith('.' + d))) {
            //     throw new CustomError(HttpStatus.Error.BadRequest, `The domain ${domain} is not in the list of allowed domains`);
            // }
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(HttpStatus.Error.BadRequest, "The provided URL is invalid");
        }
    }
    
    /**
     * Sanitize text to prevent XSS
     */
    private sanitizeText(text: string): string {
        // In a real implementation, we would use a library like DOMPurify
        // This is a basic implementation
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
