import { CustomError } from "@kit/shared/response";
import { HttpStatus } from "@kit/shared/response";
import { Embeds } from "~/lib/embeds.types";
import DOMPurify from 'dompurify';
import { Window } from 'happy-dom';

export class SecurityService {
    private window: Window;
    private baseUrl: string;
    private purify: typeof DOMPurify;

    constructor(baseUrl?: string) {
        this.window = new Window();
        this.purify = DOMPurify(this.window as Window & typeof globalThis);
        this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
    }

    sanitizeText(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    async validateEmbedData(data: Embeds.Insert | Embeds.Update): Promise<void> {
        // Validate the title if it exists
        if (data.title) {
            if (data.title.length > 255) {
                throw new CustomError(HttpStatus.Error.BadRequest, "The title cannot exceed 255 characters");
            }
            
            // Sanitize the title to prevent XSS
            data.title = this.sanitizeText(data.title);

            this.validateXssAttack(data.title);
        }
        
        // Validate and sanitize the value according to the type
        if (data.value && data.type) {
            if (data.type === 'iframe') {
                // We'll sanitize the iframe value and update the data object
                data.value = this.sanitizeIframeValue(data.value);
                // Add validation for iframe embeddability
                await this.validateIframe(data.value);
            } else if (data.type === 'url') {
                // For URLs, we'll just validate but not modify the value
                // as validateUrl will throw an error if the URL is invalid
                await this.validateUrl(data.value);
            }
        }
    }

    // New method to sanitize iframe values
    sanitizeIframeValue(value: string): string {
        // If it's a URL, return it as is (validateIframe will validate it later)
        if (value.trim().startsWith('http') && !value.includes('<iframe')) {
            return value;
        }
        
        // If it's an iframe HTML, sanitize it with DOMPurify
        const cleanIframe = this.purify.sanitize(value, {
            ALLOWED_TAGS: ['iframe'],
            ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow'],
            RETURN_DOM: false
        });
        
        return cleanIframe;
    }

    async validateIframe(value: string): Promise<void> {
        // Check if the value is a URL instead of an iframe HTML
        if (value.trim().startsWith('http') && !value.includes('<iframe')) {
            // If it's a URL, validate it as a URL
            await this.validateUrl(value);
            return;
        }
        
        // If the iframe was completely removed by sanitization, it is invalid
        if (!value.includes('<iframe')) {
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

    async validateUrl(value: string): Promise<void> {
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

    validateXssAttack(value: string): void {
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

    isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
        for (const allowedOrigin of allowedOrigins) {
            if (allowedOrigin === '*' || allowedOrigin === "'self'") {
                return true;
            }
            if (origin === allowedOrigin) {
                return true;
            }
        }
        return false;
    }
    
    getOrigin(url:string):string{
        const urlObject = new URL(url);
        return urlObject.origin;
    }
    
    getHostname(url:string):string{
        const urlObject = new URL(url);
        return urlObject.hostname;
    }
    
    getAppHostname():string{
        return new URL(this.baseUrl).hostname;
    }
    
    async checkEmbeddable(url: string): Promise<void> {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; EmbedValidator/1.0)'
                }
            });
    
            const xFrameOptions = response.headers.get('X-Frame-Options');
            if (xFrameOptions) {
                const option = xFrameOptions.toUpperCase();
                if (option === 'DENY' || option === 'SAMEORIGIN') {
                    throw new CustomError(HttpStatus.Error.BadRequest, "This site does not allow embedding (X-Frame-Options restriction)");
                }
            }
    
            const csp = response.headers.get('Content-Security-Policy');
            if (csp?.includes('frame-ancestors')) {
                const frameAncestorsMatch = csp.match(/frame-ancestors\s+([^;]+)/i);
                if (frameAncestorsMatch) {
                    const allowedAncestors = frameAncestorsMatch[1]?.split(/\s+/);
                    const embedOrigin = this.getOrigin(url);
                    const appHostname = this.getAppHostname();
    
                    if(!this.isOriginAllowed(embedOrigin,allowedAncestors ?? [])){
                        if(!allowedAncestors?.some(ancestor => ancestor.includes(appHostname))){
                            throw new CustomError(HttpStatus.Error.BadRequest, "This site restricts embedding through Content-Security-Policy");
                        }
                    }
                }
            }

            if (csp?.includes("default-src 'self'")) {
                const embedOrigin = new URL(url).origin;
                if (!embedOrigin.includes(this.baseUrl)) {
                    throw new CustomError(HttpStatus.Error.BadRequest, "This site does not allow embedding (CSP default-src 'self' restriction)");
                }
            }
    
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError(HttpStatus.Error.BadRequest, "Unable to verify if the site can be embedded");
        }
    }
}