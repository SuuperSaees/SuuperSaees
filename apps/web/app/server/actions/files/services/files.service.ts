import { IFilesService } from "./files.service.interface";
import { FilesRepository } from "../repositories/files.repository";
import { ICreateFile } from "../files.interface";
import { OrganizationsRepository } from "~/server/actions/organizations/repositories/organizations.repository";
import { FoldersRepository } from "~/server/actions/folders/repositories/folders.repository";

export class FilesService implements IFilesService {
    constructor(
        private readonly repository: FilesRepository,
        private readonly organizationsRepository?: OrganizationsRepository,
        private readonly foldersRepository?: FoldersRepository
    ) {
        this.repository = repository;
        this.organizationsRepository = organizationsRepository;
        this.foldersRepository = foldersRepository;
    }

    async createFile(createFileProps: ICreateFile, userId: string) {
        const createBaseFiles = async () => {
            const filesToInsert = createFileProps.files.map((file) => ({
                ...file,
                user_id: userId,
            }));
            return this.repository.createFiles(filesToInsert);
        };

        if (createFileProps.client_organization_id === undefined) {
            return await createBaseFiles();
        }
        const agency = await this.organizationsRepository?.getAgencyForClient(createFileProps.client_organization_id);
        if (!agency) throw new Error('Agency not found');
        if (createFileProps.currentPath && createFileProps.currentPath.length > 0) {
            const folderUuid = createFileProps.currentPath[createFileProps.currentPath.length - 1]?.uuid ?? '';
            const isOrderFolder = await this.foldersRepository?.CheckIfItIsAnOrderFolder(folderUuid);
            if (isOrderFolder) return [];
        }
        const fileData = await createBaseFiles();
        const folderFilesToInsert = fileData.map((file) => ({
            file_id: file.id,
            client_organization_id: createFileProps.client_organization_id ?? '',
            agency_id: agency.id,
            folder_id: createFileProps.currentPath && createFileProps.currentPath.length > 0
                ? createFileProps.currentPath[createFileProps.currentPath.length - 1]?.uuid
                : undefined,
        }));
        await this.foldersRepository?.createFolderFiles(folderFilesToInsert);
        return fileData;
    }

    createUploadBucketURL(file: File): Promise<string> {
        return this.repository.createUploadBucketURL(file);
    }

    getFile(fileId: string): Promise<File> {
        return this.repository.getFile(fileId);
    }

    updateFile(fileId: string, file: File): Promise<File> {
        return this.repository.updateFile(fileId, file);
    }

    deleteFile(fileId: string): Promise<void> {
        return this.repository.deleteFile(fileId);
    }

    getFiles(): Promise<File[]> {
        return this.repository.getFiles();
    }   

    deleteOrderBriefFile(orderBriefId: string): Promise<void> {
        return this.repository.deleteOrderBriefFile(orderBriefId);
    }

    downloadFiles(fileIds: string[]): Promise<File[]> {
        return this.repository.downloadFiles(fileIds);
    }

    getFilesWithoutFolder(folderId: string): Promise<File[]> {
        return this.repository.getFilesWithoutFolder(folderId);
    }

    getFilesByFolder(folderId: string): Promise<File[]> {
        return this.repository.getFilesByFolder(folderId);
    }

    verifyItIsOrderFile(orderId: string): Promise<boolean> {
        return this.repository.verifyItIsOrderFile(orderId);
    }

    getMemberFiles(memberId: string): Promise<File[]> {
        return this.repository.getMemberFiles(memberId);
    }

    getClientFiles(clientId: string): Promise<File[]> {
        return this.repository.getClientFiles(clientId);
    }

    getUrlFile(fileId: string): Promise<string> {
        return this.repository.getUrlFile(fileId);
    }
}