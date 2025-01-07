import { Database } from '~/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { cookies } from 'next/headers';
import { IBaseAction } from './base-action.interface';
/**
* Abstract base class for server actions that require Supabase access
* Implements Singleton pattern to ensure single instance per request
*/
export abstract class BaseAction implements IBaseAction {
    /**
    * Map to store instances of the class
    * @description This map is used to store instances of the class
    */
    private static instances = new Map<string, BaseAction>();
    protected client: SupabaseClient<Database>;
    protected adminClient: SupabaseClient<Database>;
    protected baseUrl: string;
     protected constructor(baseUrl?: string) {
      this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
      
       // Safe initialization of Supabase clients
      try {
        this.client = getSupabaseServerComponentClient();
        this.adminClient = getSupabaseServerComponentClient({
          admin: true,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to initialize Supabase clients: ${errorMessage}`);
        throw new Error(`Failed to initialize Supabase clients: ${errorMessage}`);
      }
    }
     /**
     * Gets the unique instance of the specific class
     * @param baseUrl Optional URL to be used as base URL
     * @returns Instance of the class
     * @description This method returns the unique instance of the class
     */
 protected static getInstance<T extends BaseAction>(this: new () => T): T {
   const className = this.name;
    // Server environment validation
   if (typeof window !== 'undefined') {
     throw new Error(`${className} can only be instantiated on the server side`);
   }
    // Next.js context validation
   try {
     cookies().getAll();
   } catch (e) {
     throw new Error(
       `${className} must be used within a Next.js Route Handler or Server Component`
     );
   }
    // Get or create instance
   if (!BaseAction.instances.has(className)) {
     BaseAction.instances.set(className, new this());
   }
    return BaseAction.instances.get(className) as T;
 }
  /**
  * Resets all instances (useful for testing)
  * @description This method clears all instances of the class
  */
 protected static resetInstances(): void {
   BaseAction.instances.clear();
 }
  /**
  * Resets a specific instance (useful for testing)
  * @param className - The name of the class to reset
  * @description This method deletes a specific instance of the class
  */
 protected static resetInstance(className: string): void {
   BaseAction.instances.delete(className);
 }
}