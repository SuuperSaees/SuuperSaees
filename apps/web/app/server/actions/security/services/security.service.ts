import { CustomError } from "@kit/shared/response";
import { HttpStatus } from "@kit/shared/response";
import { Embeds } from "~/lib/embeds.types";
import DOMPurify from 'dompurify';
import { Window } from 'happy-dom';

export class SecurityService {
    private window: Window;
    private purify: typeof DOMPurify;

    constructor() {
        // Inicializar DOMPurify con happy-dom para uso en el servidor
        this.window = new Window();
        this.purify = DOMPurify(this.window as Window & typeof globalThis);
    }

    sanitizeText(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    validateEmbedData(data: Embeds.Insert | Embeds.Update): void {
        // Validate the title if it exists
        if (data.title) {
            if (data.title.length > 255) {
                throw new CustomError(HttpStatus.Error.BadRequest, "The title cannot exceed 255 characters");
            }
            
            // Sanitize the title to prevent XSS
            data.title = this.sanitizeText(data.title);

            this.validateXssAttack(data.title);
        }
        
        // Validate the value according to the type
        if (data.value && data.type) {
            if (data.type === 'iframe') {
                void this.validateIframe(data.value);
            } else if (data.type === 'url') {
                void this.validateUrl(data.value);
            }
        }
    }

    private async validateIframe(value: string): Promise<void> {
        // Sanitize the iframe with DOMPurify
        const cleanIframe = this.purify.sanitize(value, {
            ALLOWED_TAGS: ['iframe'],
            ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow'],
            RETURN_DOM: false
        });

        // If the iframe was completely removed, it is invalid
        if (!cleanIframe?.includes('<iframe')) {
            throw new CustomError(HttpStatus.Error.BadRequest, "The value must be a valid iframe HTML");
        }
        
        // Extract the src attribute
        const srcMatch = value.match(/src=["'](.*?)["']/);
        if (!srcMatch) {
            throw new CustomError(HttpStatus.Error.BadRequest, "The iframe must contain a valid src attribute");
        }
        
        const src = srcMatch[1];
        
        // Validate that the src is a secure URL
        if (src) {
            await this.validateUrl(src);
            
            // Verify if the site allows embedding
            await this.checkEmbeddable(src);
        } else {
            throw new CustomError(HttpStatus.Error.BadRequest, "The iframe must contain a valid src attribute");
        }
        
        // Validate that it does not contain scripts or events
        this.validateXssAttack(value);
    }

    private async validateUrl(value: string): Promise<void> {
        try {
            this.validateXssAttack(value);

            const url = new URL(value);
            
            // Validate the secure protocol
            if (url.protocol !== 'https:') {
                throw new CustomError(HttpStatus.Error.BadRequest, "Only HTTPS URLs are allowed");
            }
            
            // Verify if the site allows embedding
            await this.checkEmbeddable(value);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(HttpStatus.Error.BadRequest, "The provided URL is invalid");
        }
    }

    private validateXssAttack(value: string): void {
        // Improved validation to prevent XSS attacks
        // Search for common XSS patterns
        const xssPatterns = [
            /<script\b[^>]*>(.*?)<\/script>/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /data:(?!image\/)/i,
            /vbscript:/i,
            /expression\s*\(/i,
            /eval\s*\(/i,
            /document\.cookie/i,
            /document\.location/i,
            /document\.write/i,
            /window\.location/i,
            /\.innerHTML/i,
            /\.outerHTML/i,
            /alert\s*\(/i,
            /prompt\s*\(/i,
            /confirm\s*\(/i
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(value)) {
                throw new CustomError(HttpStatus.Error.BadRequest, "The value contains potentially dangerous code");
            }
        }
        
        // Use DOMPurify for additional validation
        const clean = this.purify.sanitize(value, {
            RETURN_DOM: false,
            SANITIZE_DOM: true
        });
        
        // If DOMPurify modified the content significantly, it may be malicious
        if (clean.length < value.length * 0.8) {
            throw new CustomError(HttpStatus.Error.BadRequest, "The value contains potentially dangerous code");
        }
    }

    private async checkEmbeddable(url: string): Promise<void> {
        try {
            // Make a HEAD request to verify the headers
            const response = await fetch(url, { 
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; EmbedValidator/1.0)'
                }
            });

            // Verify X-Frame-Options
            const xFrameOptions = response.headers.get('X-Frame-Options');
            if (xFrameOptions) {
                const option = xFrameOptions.toUpperCase();
                if (option === 'DENY' || option === 'SAMEORIGIN') {
                    throw new CustomError(HttpStatus.Error.BadRequest, "This site does not allow embedding (X-Frame-Options restriction)");
                }
            }

            // Verify Content-Security-Policy for frame-ancestors
            const csp = response.headers.get('Content-Security-Policy');
            if (csp && csp.includes('frame-ancestors') && !csp.includes('frame-ancestors *')) {
                // Verify if our URL is allowed in frame-ancestors
                const frameAncestorsMatch = csp.match(/frame-ancestors\s+([^;]+)/i);
                if (frameAncestorsMatch) {
                    const allowedAncestors = frameAncestorsMatch[1].split(/\s+/);
                    // If it does not include 'self', '*' or our domain, it is not allowed to embed
                    if (!allowedAncestors.some(ancestor => 
                        ancestor === '*' || 
                        ancestor === "'self'" || 
                        ancestor.includes(new URL(process.env.APP_URL || 'https://example.com').hostname)
                    )) {
                        throw new CustomError(HttpStatus.Error.BadRequest, "This site restricts embedding through Content-Security-Policy");
                    }
                }
            }
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            // If there is an error in the request, we assume that it cannot be embedded
            throw new CustomError(HttpStatus.Error.BadRequest, "Unable to verify if the site can be embedded");
        }
    }
}