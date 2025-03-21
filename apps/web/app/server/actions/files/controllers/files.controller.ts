import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { FilesService } from '../services/files.service';
import { FilesRepository } from '../repositories/files.repository';
import { ICreateFile } from '../files.interface';
import { OrganizationsRepository } from '~/server/actions/organizations/repositories/organizations.repository';
import { FoldersRepository } from '~/server/actions/folders/repositories/folders.repository';
import { File } from '~/lib/file.types';
import { OrdersRepository } from '~/server/actions/orders/repositories/orders.repository';
export class FilesController {

   private baseUrl: string
   private client: SupabaseClient<Database>
   private adminClient?: SupabaseClient<Database>

   constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
    this.baseUrl = baseUrl;
    this.client = client;
    this.adminClient = adminClient;
   }

   async createFile(createFileProps: ICreateFile): Promise<File.Type[]> {
    try {
        const { data: userData, error: userError } = await this.client.auth.getUser();
        if (userError) throw userError.message;

        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const organizationsRepository = new OrganizationsRepository(this.client, this.adminClient);
        const foldersRepository = new FoldersRepository(this.client, this.adminClient);

        const fileService = new FilesService(fileRepository, organizationsRepository, foldersRepository);
        return fileService.createFile(createFileProps, userData.user.id);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error creating file: ${error.message}`);
        }
        throw new Error('Error creating file');
    }
    }

    async getFile(fileId?: string, orderId?: string): Promise<File.Type> {
        try {
            const fileRepository = new FilesRepository(this.client, this.adminClient);
            const orderRepository = new OrdersRepository(this.client, this.adminClient);
            const fileService = new FilesService(fileRepository, undefined, undefined, orderRepository);
            return fileService.getFile(fileId, orderId);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error getting file: ${error.message}`);
            }
            throw new Error('Error getting file');
        }
    }

    createUploadBucketURL(file: File): Promise<string> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.createUploadBucketURL(file);
    }


    updateFile(fileId: string, file: File): Promise<File> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.updateFile(fileId, file);
    }

    deleteFile(fileId: string): Promise<void> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.deleteFile(fileId);
    }

    getFiles(): Promise<File[]> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.getFiles();
    }

    deleteOrderBriefFile(orderBriefId: string): Promise<void> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.deleteOrderBriefFile(orderBriefId);
    }

    downloadFiles(fileIds: string[]): Promise<File[]> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.downloadFiles(fileIds);
    }

    getFilesWithoutFolder(folderId: string): Promise<File[]> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.getFilesWithoutFolder(folderId);
    }

    getFilesByFolder(folderId: string): Promise<File[]> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.getFilesByFolder(folderId);
    }

    verifyItIsOrderFile(orderId: string): Promise<boolean> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.verifyItIsOrderFile(orderId);
    }

    getMemberFiles(memberId: string): Promise<File[]> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.getMemberFiles(memberId);
    }

    getClientFiles(clientId: string): Promise<File[]> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.getClientFiles(clientId);
    }

    getUrlFile(fileId: string): Promise<string> {
        const fileRepository = new FilesRepository(this.client, this.adminClient);
        const fileService = new FilesService(fileRepository);
        return fileService.getUrlFile(fileId);
    }
}