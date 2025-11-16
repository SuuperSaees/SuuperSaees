import { BaseAction } from '../base-action';
import { IFilesAction, ICreateFile } from './files.interface';
import { FilesController } from './controllers/files.controller';
import { File } from '~/lib/file.types';

export class FilesAction extends BaseAction implements IFilesAction {
    private controller: FilesController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new FilesController(this.baseUrl, this.client, this.adminClient);
    }
    async createFile(createFileProps: ICreateFile) {
        return await this.controller.createFile(createFileProps);
    }

    createUploadBucketURL(file: File): Promise<string> {
        return this.controller.createUploadBucketURL(file);
    }

    deleteFile(fileId: string): Promise<void> {
        return this.controller.deleteFile(fileId);
    }

    getFile(fileId?: string, orderId?: string): Promise<File.Type> {
        return this.controller.getFile(fileId, orderId);
    }

    getFiles(): Promise<File[]> {
        return this.controller.getFiles();
    }

    deleteOrderBriefFile(orderBriefId: string): Promise<void> {
        return this.controller.deleteOrderBriefFile(orderBriefId);
    }

    downloadFiles(fileIds: string[]): Promise<File[]> {
        return this.controller.downloadFiles(fileIds);
    }

    getFilesWithoutFolder(folderId: string): Promise<File[]> {
        return this.controller.getFilesWithoutFolder(folderId);
    }

    getFilesByFolder(folderId: string): Promise<File[]> {
        return this.controller.getFilesByFolder(folderId);
    }

    verifyItIsOrderFile(orderId: string): Promise<boolean> {
        return this.controller.verifyItIsOrderFile(orderId);
    }

    getMemberFiles(memberId: string): Promise<File[]> {
        return this.controller.getMemberFiles(memberId);
    }

    getClientFiles(clientId: string): Promise<File[]> {
        return this.controller.getClientFiles(clientId);
    }

    getUrlFile(fileId: string): Promise<string> {
        return this.controller.getUrlFile(fileId);
    }

    updateFile(fileId: string, file: File): Promise<File> {
        return this.controller.updateFile(fileId, file);
    }
}

export function createFilesAction(baseUrl: string) {
    return new FilesAction(baseUrl);
}
