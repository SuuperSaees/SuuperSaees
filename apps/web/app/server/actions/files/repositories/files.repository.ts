import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { File } from "~/lib/file.types";

export class FilesRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async createFiles(filesToInsert: File.Insert[]): Promise<File.Type[]> {
        const { data: fileData, error: fileError } = await this.client
          .from('files')
          .insert(filesToInsert)
          .select();

        if (fileError) throw fileError;

        return fileData;
    }

    async getFile(fileId?: string): Promise<File.Type> {
        const res = await this.client
        .from('files')
        .select('*')
        .eq('id', fileId ?? '')
        .single();

        if (res.error) throw res.error;

        return res.data as File.Type;
    }
    
    async createUploadBucketURL(file: File): Promise<string> {
        const res = await this.client.storage.from('files').createSignedUrl(file.name, 60);
        return res.signedUrl;
    }
    

    async updateFile(fileId: string, file: File): Promise<File> {
        const res = await this.client.from('files').update({
            name: file.name,
            type: file.type,
            size: file.size,
            url: file.url
        }).eq('id', fileId);
        return res.data;
    }

    async deleteFile(fileId: string): Promise<void> {
        await this.client.from('files').delete().eq('id', fileId);
    }

    async getFiles(): Promise<File[]> {
        const res = await this.client.from('files').select('*');
        return res.data;
    }

    async deleteOrderBriefFile(orderBriefId: string): Promise<void> {
        await this.client.from('files').delete().eq('order_brief_id', orderBriefId);
    }   

    async downloadFiles(fileIds: string[]): Promise<File[]> {
        const res = await this.client.from('files').select('*').in('id', fileIds);
        return res.data;
    }

    async getFilesWithoutFolder(folderId: string): Promise<File[]> {
        const res = await this.client.from('files').select('*').eq('folder_id', folderId);
        return res.data;
    }

    async getFilesByFolder(folderId: string): Promise<File[]> {
        const res = await this.client.from('files').select('*').eq('folder_id', folderId);
        return res.data;
    }

    async verifyItIsOrderFile(orderId: string): Promise<boolean> {
        const res = await this.client.from('files').select('*').eq('order_id', orderId);
        return res.data.length > 0;
    }

    async getMemberFiles(memberId: string): Promise<File[]> {
        const res = await this.client.from('files').select('*').eq('member_id', memberId);
        return res.data;
    }

    async getClientFiles(clientId: string): Promise<File[]> {
        const res = await this.client.from('files').select('*').eq('client_id', clientId);
        return res.data;
    }

    async getUrlFile(fileId: string): Promise<string> {
        const res = await this.client.from('files').select('*').eq('id', fileId).single();
        return res.data?.url;
    }
}
